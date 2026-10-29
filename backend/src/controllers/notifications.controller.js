const prisma = require('../config/db');

async function getMine(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { complaint: { select: { complaintCode: true, title: true } } },
    });
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({ where: { id: Number(id) } });
    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    const updated = await prisma.notification.update({
      where: { id: Number(id) },
      data: { isRead: true },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMine, markRead };
