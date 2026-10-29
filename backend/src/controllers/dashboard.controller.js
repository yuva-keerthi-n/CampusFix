const prisma = require('../config/db');

async function countByStatus(where = {}) {
  const statuses = ['Reported', 'Under_Review', 'Assigned', 'In_Progress', 'Resolved', 'Rejected'];
  const counts = await Promise.all(
    statuses.map((status) => prisma.complaint.count({ where: { ...where, status } }))
  );
  return Object.fromEntries(statuses.map((status, i) => [status, counts[i]]));
}

async function getStats(req, res, next) {
  try {
    const { role, id } = req.user;

    let scope = {};
    if (role === 'student') scope = { reportedBy: id };
    if (role === 'staff') scope = { assignedTo: id };
    // admin: no scope -> sees everything

    const [total, byStatus, critical, byCategory, byLocation] = await Promise.all([
      prisma.complaint.count({ where: scope }),
      countByStatus(scope),
      prisma.complaint.count({ where: { ...scope, priority: 'Critical', status: { notIn: ['Resolved', 'Rejected'] } } }),
      prisma.complaint.groupBy({
        by: ['categoryId'],
        where: scope,
        _count: { _all: true },
      }),
      prisma.complaint.groupBy({
        by: ['locationId'],
        where: scope,
        _count: { _all: true },
      }),
    ]);

    // Resolve category/location names for the grouped charts
    const [categories, locations] = await Promise.all([
      prisma.category.findMany(),
      prisma.location.findMany(),
    ]);
    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
    const locationMap = Object.fromEntries(locations.map((l) => [l.id, l.name]));

    res.json({
      success: true,
      data: {
        total,
        pending: byStatus['Reported'] + byStatus['Under_Review'],
        assigned: byStatus['Assigned'],
        inProgress: byStatus['In_Progress'],
        resolved: byStatus['Resolved'],
        rejected: byStatus['Rejected'],
        critical,
        byStatus,
        byCategory: byCategory.map((c) => ({ name: categoryMap[c.categoryId], count: c._count._all })),
        byLocation: byLocation.map((l) => ({ name: locationMap[l.locationId], count: l._count._all })),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };

