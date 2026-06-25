const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/payments.controller');

router.use(protect);
router.post('/stripe/intent', ctrl.createStripePaymentIntent);
router.post('/confirm', ctrl.confirmPayment);
router.post('/refund', authorize('admin'), ctrl.processRefund);

module.exports = router;
