const express = require('express');
const router = express.Router();
const complaintsController = require('../controllers/complaints.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { uploadComplaintImage, uploadResolutionImage } = require('../middleware/upload');

router.use(authenticate);

router.get('/', complaintsController.getAll);
router.post('/', authorize('student'), uploadComplaintImage.single('image'), complaintsController.create);
router.get('/:id', complaintsController.getById);
router.put('/:id', authorize('admin'), complaintsController.update);
router.delete('/:id', authorize('admin'), complaintsController.remove);

router.put('/:id/status', authorize('admin', 'staff'), complaintsController.updateStatus);
router.put('/:id/assign', authorize('admin'), complaintsController.assign);
router.post('/:id/resolve', authorize('staff'), uploadResolutionImage.single('image'), complaintsController.resolve);

module.exports = router;
