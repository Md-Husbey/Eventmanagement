const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/admin.controller');

router.use(protect, authorize('admin'));

router.get('/dashboard', ctrl.getDashboardStats);
router.get('/users', ctrl.getAllUsers);
router.put('/users/:id', ctrl.updateUser);
router.delete('/users/:id', ctrl.deleteUser);
router.get('/events', ctrl.getAllEvents);
router.put('/events/:id/status', ctrl.approveEvent);
router.get('/applications', ctrl.getOrganizerApplications);
router.put('/applications/:id', ctrl.reviewApplication);
router.get('/revenue', ctrl.getRevenueReport);

module.exports = router;
