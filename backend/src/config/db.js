const { PrismaClient } = require('@prisma/client');

// Reuse a single PrismaClient instance across the app (recommended by Prisma docs)
// to avoid exhausting DB connections during development hot-reloads.
const prisma = new PrismaClient();

module.exports = prisma;
