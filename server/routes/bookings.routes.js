const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/bookings.controller');

router.use(protect);
router.post('/', ctrl.createBooking);
router.get('/', ctrl.getMyBookings);
router.get('/:id', ctrl.getBooking);
router.put('/:id/cancel', ctrl.cancelBooking);
router.get('/manager/sold', authorize('manager', 'admin'), ctrl.getSoldTickets);
router.post('/scan', authorize('manager', 'admin'), ctrl.scanQR);

module.exports = router;
