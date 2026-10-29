const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

router.get('/', notificationsController.getMine);
router.put('/:id/read', notificationsController.markRead);

module.exports = router;
