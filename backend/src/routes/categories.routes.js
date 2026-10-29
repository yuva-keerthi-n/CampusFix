const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, categoriesController.getAll);
router.post('/', authenticate, authorize('admin'), categoriesController.create);
router.put('/:id', authenticate, authorize('admin'), categoriesController.update);
router.delete('/:id', authenticate, authorize('admin'), categoriesController.remove);

module.exports = router;
