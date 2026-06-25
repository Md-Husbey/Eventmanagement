const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/events.controller');

router.get('/', ctrl.getEvents);
router.get('/featured', ctrl.getFeaturedEvents);
router.get('/my', protect, authorize('manager', 'admin'), ctrl.getMyEvents);
router.get('/:id', ctrl.getEvent);
router.post('/', protect, authorize('manager', 'admin'), ctrl.createEvent);
router.put('/:id', protect, authorize('manager', 'admin'), ctrl.updateEvent);
router.delete('/:id', protect, authorize('manager', 'admin'), ctrl.deleteEvent);

module.exports = router;
