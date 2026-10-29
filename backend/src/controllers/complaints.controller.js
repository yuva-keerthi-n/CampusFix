const prisma = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const generateComplaintCode = require('../utils/generateComplaintCode');
const { recordHistory } = require('../services/history.service');
const { notify } = require('../services/notification.service');

const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const VALID_STATUSES = ['Reported', 'Under_Review', 'Assigned', 'In_Progress', 'Resolved', 'Rejected'];

const complaintListSelect = {
  id: true,
  complaintCode: true,
  title: true,
  priority: true,
  status: true,
  createdAt: true,
  category: { select: { id: true, name: true } },
  location: { select: { id: true, name: true } },
  reporter: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true } },
};

// POST /api/complaints  (student)
async function create(req, res, next) {
  try {
    const { title, categoryId, locationId, description, priority } = req.body;

    if (!title || !categoryId || !locationId || !description || !priority) {
      throw new ApiError(400, 'Title, category, location, description and priority are all required.');
    }
    if (!VALID_PRIORITIES.includes(priority)) {
      throw new ApiError(400, `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
    }

    const imageUrl = req.file ? `/uploads/complaints/${req.file.filename}` : null;
    const complaintCode = await generateComplaintCode();

    const complaint = await prisma.complaint.create({
      data: {
        complaintCode,
        title,
        description,
        priority,
        categoryId: Number(categoryId),
        locationId: Number(locationId),
        reportedBy: req.user.id,
        imageUrl,
      },
    });

    await recordHistory(complaint.id, 'Reported', req.user.id, 'Complaint submitted.');
    await notify(req.user.id, complaint.id, `Your complaint ${complaint.complaintCode} has been submitted.`);

    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
}

// GET /api/complaints  (role-scoped list + filters + search)
async function getAll(req, res, next) {
  try {
    const { role, id } = req.user;
    const { status, category, priority, location, search, dateFrom, dateTo } = req.query;

    const where = {};

    if (role === 'student') where.reportedBy = id;
    if (role === 'staff') where.assignedTo = id;

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.categoryId = Number(category);
    if (location) where.locationId = Number(location);

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    if (search) {
      where.OR = [
        { complaintCode: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
        { location: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const complaints = await prisma.complaint.findMany({
      where,
      select: complaintListSelect,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: complaints });
  } catch (err) {
    next(err);
  }
}

// GET /api/complaints/:id
async function getById(req, res, next) {
  try {
    const { id } = req.params;

    const complaint = await prisma.complaint.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        location: true,
        reporter: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        resolution: true,
        history: { orderBy: { createdAt: 'asc' }, include: { user: { select: { name: true, role: true } } } },
      },
    });

    if (!complaint) throw new ApiError(404, 'Complaint not found.');

    const { role, id: userId } = req.user;
    const isOwner = complaint.reportedBy === userId;
    const isAssignee = complaint.assignedTo === userId;
    if (role !== 'admin' && !isOwner && !isAssignee) {
      throw new ApiError(403, 'You do not have access to this complaint.');
    }

    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
}

// PUT /api/complaints/:id  (admin: edit core fields; e.g. priority correction)
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, priority, categoryId, locationId } = req.body;

    const data = {};
    if (title) data.title = title;
    if (description) data.description = description;
    if (priority) {
      if (!VALID_PRIORITIES.includes(priority)) throw new ApiError(400, 'Invalid priority.');
      data.priority = priority;
    }
    if (categoryId) data.categoryId = Number(categoryId);
    if (locationId) data.locationId = Number(locationId);

    const complaint = await prisma.complaint.update({ where: { id: Number(id) }, data });
    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/complaints/:id  (admin only)
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.complaint.delete({ where: { id: Number(id) } });
    res.json({ success: true, message: 'Complaint deleted.' });
  } catch (err) {
    next(err);
  }
}

// PUT /api/complaints/:id/status  (admin or assigned staff)
async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      throw new ApiError(400, `Status must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const complaint = await prisma.complaint.findUnique({ where: { id: Number(id) } });
    if (!complaint) throw new ApiError(404, 'Complaint not found.');

    const { role, id: userId } = req.user;
    if (role === 'staff' && complaint.assignedTo !== userId) {
      throw new ApiError(403, 'This complaint is not assigned to you.');
    }
    if (role === 'student') {
      throw new ApiError(403, 'Students cannot change complaint status.');
    }

    const data = { status };
    if (status === 'Resolved') data.resolvedAt = new Date();

    const updated = await prisma.complaint.update({ where: { id: Number(id) }, data });

    await recordHistory(updated.id, status, userId, note || null);
    await notify(
      complaint.reportedBy,
      updated.id,
      `Your complaint ${updated.complaintCode} status changed to "${status.split("_").join(" ")}".`
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

// PUT /api/complaints/:id/assign  (admin only)
async function assign(req, res, next) {
  try {
    const { id } = req.params;
    const { staffId } = req.body;

    if (!staffId) throw new ApiError(400, 'staffId is required.');

    const staff = await prisma.user.findUnique({ where: { id: Number(staffId) } });
    if (!staff || staff.role !== 'staff') throw new ApiError(400, 'staffId must reference a valid staff user.');

    const complaint = await prisma.complaint.update({
      where: { id: Number(id) },
      data: { assignedTo: Number(staffId), status: 'Assigned' },
    });

    await recordHistory(complaint.id, 'Assigned', req.user.id, `Assigned to ${staff.name}.`);
    await notify(complaint.reportedBy, complaint.id, `Your complaint ${complaint.complaintCode} has been assigned to maintenance staff.`);
    await notify(staff.id, complaint.id, `You have been assigned complaint ${complaint.complaintCode}.`);

    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
}

// POST /api/complaints/:id/resolve  (assigned staff) - resolution notes + optional image, sets status Resolved
async function resolve(req, res, next) {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const complaint = await prisma.complaint.findUnique({ where: { id: Number(id) } });
    if (!complaint) throw new ApiError(404, 'Complaint not found.');
    if (complaint.assignedTo !== req.user.id) {
      throw new ApiError(403, 'This complaint is not assigned to you.');
    }

    const imageUrl = req.file ? `/uploads/resolutions/${req.file.filename}` : null;

    const resolution = await prisma.resolution.upsert({
      where: { complaintId: Number(id) },
      update: { notes, imageUrl: imageUrl || undefined, resolvedBy: req.user.id },
      create: { complaintId: Number(id), notes, imageUrl, resolvedBy: req.user.id },
    });

    const updated = await prisma.complaint.update({
      where: { id: Number(id) },
      data: { status: 'Resolved', resolvedAt: new Date() },
    });

    await recordHistory(updated.id, 'Resolved', req.user.id, notes || 'Issue resolved.');
    await notify(complaint.reportedBy, updated.id, `Your complaint ${updated.complaintCode} has been resolved.`);

    res.json({ success: true, data: { complaint: updated, resolution } });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getAll, getById, update, remove, updateStatus, assign, resolve };


