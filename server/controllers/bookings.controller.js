const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { Booking, Event, Ticket, Payment, Notification, User } = require('../models');
const { sendEmail, bookingConfirmationEmail } = require('../utils/email');

const generateBookingRef = () => `SFB-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

exports.createBooking = async (req, res) => {
  try {
    const { eventId, ticketId, quantity = 1 } = req.body;

    const [event, ticket] = await Promise.all([
      Event.findByPk(eventId),
      Ticket.findByPk(ticketId),
    ]);

    if (!event || event.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Event not available' });
    }
    if (!ticket || ticket.eventId !== eventId) {
      return res.status(400).json({ success: false, message: 'Invalid ticket' });
    }
    if (ticket.quantity - ticket.sold < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough tickets available' });
    }

    const totalAmount = ticket.price * quantity;
    const bookingRef = generateBookingRef();
    const qrData = JSON.stringify({ ref: bookingRef, event: event.id, user: req.user.id });
    const qrCode = await QRCode.toDataURL(qrData);

    const booking = await Booking.create({
      bookingRef,
      userId: req.user.id,
      eventId,
      ticketId,
      quantity,
      totalAmount,
      qrCode,
      qrCodeData: qrData,
      status: 'pending',
    });

    await ticket.increment('sold', { by: quantity });

    // Notification
    await Notification.create({
      userId: req.user.id,
      type: 'booking_confirmed',
      title: 'Booking Created',
      message: `Your booking for ${event.title} has been created. Complete payment to confirm.`,
      link: `/bookings/${booking.id}`,
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Event, as: 'event' },
        { model: Ticket, as: 'ticket' },
        { model: Payment, as: 'payment' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        { model: Event, as: 'event' },
        { model: Ticket, as: 'ticket' },
        { model: Payment, as: 'payment' },
      ],
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
    }
    await booking.update({ status: 'cancelled' });
    await Ticket.findByPk(booking.ticketId).then(t => t?.decrement('sold', { by: booking.quantity }));
    res.json({ success: true, message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSoldTickets = async (req, res) => {
  try {
    const { eventId, status, search } = req.query;
    const myEvents = await Event.findAll({ where: { organizerId: req.user.id }, attributes: ['id'] });
    const eventIds = myEvents.map(e => e.id);
    if (!eventIds.length) return res.json({ success: true, bookings: [] });

    const where = { eventId: eventIds };
    if (eventId) where.eventId = eventId;
    if (status) where.status = status;

    const bookings = await Booking.findAll({
      where,
      include: [
        { model: Event, as: 'event', attributes: ['id', 'title', 'date', 'location'] },
        { model: Ticket, as: 'ticket', attributes: ['type', 'price'] },
        { model: User, as: 'user', attributes: ['name', 'email', 'phone'] },
        { model: Payment, as: 'payment', attributes: ['method', 'status'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const result = search
      ? bookings.filter(b =>
          b.bookingRef.toLowerCase().includes(search.toLowerCase()) ||
          b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          b.user?.email?.toLowerCase().includes(search.toLowerCase())
        )
      : bookings;

    res.json({ success: true, bookings: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.scanQR = async (req, res) => {
  try {
    const { qrData } = req.body;
    const parsed = JSON.parse(qrData);
    const booking = await Booking.findOne({
      where: { bookingRef: parsed.ref },
      include: [{ model: Event, as: 'event' }, { model: User, as: 'user', attributes: ['name', 'email'] }],
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.isScanned) return res.status(400).json({ success: false, message: 'Ticket already scanned' });
    if (booking.status !== 'confirmed') return res.status(400).json({ success: false, message: 'Booking not confirmed' });

    await booking.update({ isScanned: true, scannedAt: new Date(), status: 'attended' });
    res.json({ success: true, message: 'Entry verified', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
