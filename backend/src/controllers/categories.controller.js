const prisma = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

async function getAll(req, res, next) {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) throw new ApiError(400, 'Category name is required.');
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) throw new ApiError(400, 'Category name is required.');
    const category = await prisma.category.update({ where: { id: Number(id) }, data: { name } });
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id: Number(id) } });
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, update, remove };
