const prisma = require('../config/db');

async function notify(userId, complaintId, message) {
  return prisma.notification.create({
    data: { userId, complaintId, message },
  });
}

module.exports = { notify };
