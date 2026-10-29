const express = require('express');
const router = express.Router();
const locationsController = require('../controllers/locations.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, locationsController.getAll);
router.post('/', authenticate, authorize('admin'), locationsController.create);
router.put('/:id', authenticate, authorize('admin'), locationsController.update);
router.delete('/:id', authenticate, authorize('admin'), locationsController.remove);

module.exports = router;
