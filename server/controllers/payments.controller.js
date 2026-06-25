const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Payment, Booking, Event, Ticket, User, Notification } = require('../models');
const { sendEmail, bookingConfirmationEmail } = require('../utils/email');

exports.createStripePaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findOne({
      where: { id: bookingId, userId: req.user.id },
      include: [{ model: Event, as: 'event' }],
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100),
      currency: 'usd',
      metadata: { bookingId, userId: req.user.id },
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { bookingId, method, transactionId } = req.body;
    const booking = await Booking.findOne({
      where: { id: bookingId, userId: req.user.id },
      include: [
        { model: Event, as: 'event' },
        { model: Ticket, as: 'ticket' },
      ],
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const payment = await Payment.create({
      bookingId,
      userId: req.user.id,
      amount: booking.totalAmount,
      method,
      status: 'completed',
      transactionId,
    });

    await booking.update({ status: 'confirmed' });

    const user = await User.findByPk(req.user.id);
    const emailData = bookingConfirmationEmail(user, booking, booking.event, booking.qrCode);
    await sendEmail(emailData).catch(() => {});

    await Notification.create({
      userId: req.user.id,
      type: 'booking_confirmed',
      title: 'Payment Successful',
      message: `Payment confirmed for ${booking.event.title}. Your QR ticket is ready.`,
      link: `/bookings/${booking.id}`,
    });

    res.json({ success: true, payment, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.processRefund = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Payment, as: 'payment' }],
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    await booking.payment.update({
      status: 'refunded',
      refundAmount: booking.payment.amount,
      refundReason: reason,
      refundedAt: new Date(),
    });
    await booking.update({ status: 'refunded' });
    await Ticket.findByPk(booking.ticketId).then(t => t?.decrement('sold', { by: booking.quantity }));

    await Notification.create({
      userId: booking.userId,
      type: 'refund_issued',
      title: 'Refund Issued',
      message: `A refund of ৳${booking.payment.amount} has been processed.`,
    });

    res.json({ success: true, message: 'Refund processed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
