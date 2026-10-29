const prisma = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

async function getAll(req, res, next) {
  try {
    const locations = await prisma.location.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: locations });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) throw new ApiError(400, 'Location name is required.');
    const location = await prisma.location.create({ data: { name } });
    res.status(201).json({ success: true, data: location });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) throw new ApiError(400, 'Location name is required.');
    const location = await prisma.location.update({ where: { id: Number(id) }, data: { name } });
    res.json({ success: true, data: location });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.location.delete({ where: { id: Number(id) } });
    res.json({ success: true, message: 'Location deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, update, remove };
