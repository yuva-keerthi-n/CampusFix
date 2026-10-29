const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, authorize('admin'), usersController.getAll);

module.exports = router;
