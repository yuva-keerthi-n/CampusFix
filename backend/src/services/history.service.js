const prisma = require('../config/db');

async function recordHistory(complaintId, status, changedBy, note = null) {
  return prisma.complaintHistory.create({
    data: { complaintId, status, changedBy, note },
  });
}

module.exports = { recordHistory };
