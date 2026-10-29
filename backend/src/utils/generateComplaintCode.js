const prisma = require('../config/db');

/**
 * Generates the next sequential complaint code for the current year, e.g. CF-2026-0007.
 * Looks at the highest existing code for this year and adds 1, so codes stay unique
 * even if an older complaint was deleted. Fine for a single-server college demo.
 */
async function generateComplaintCode() {
  const year = new Date().getFullYear();
  const prefix = `CF-${year}-`;

  const latest = await prisma.complaint.findFirst({
    where: { complaintCode: { startsWith: prefix } },
    orderBy: { complaintCode: 'desc' },
    select: { complaintCode: true },
  });

  const lastNumber = latest ? parseInt(latest.complaintCode.slice(prefix.length), 10) : 0;
  return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`;
}

module.exports = generateComplaintCode;
