require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const { Sequelize, DataTypes, Op } = require('sequelize');

// ─── DATABASE ───────────────────────────────────────────────────────────────
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  }
);

// ─── MODELS ─────────────────────────────────────────────────────────────────
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM('customer', 'manager', 'hotel_manager', 'support', 'finance', 'admin'),
    defaultValue: 'customer',
  },
  phone: { type: DataTypes.STRING },
  avatar: { type: DataTypes.STRING },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  isSuspended: { type: DataTypes.BOOLEAN, defaultValue: false },
  resetPasswordToken: { type: DataTypes.STRING },
  resetPasswordExpire: { type: DataTypes.DATE },
}, {
  hooks: {
    beforeCreate: async (user) => { user.password = await bcrypt.hash(user.password, 12); },
    beforeUpdate: async (user) => {
      if (user.changed('password')) user.password = await bcrypt.hash(user.password, 12);
    },
  },
});
User.prototype.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

const Event = sequelize.define('Event', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  category: {
    type: DataTypes.ENUM(
      'dj_party', 'beach_party', 'food_festival', 'music_concert',
      'wedding_event', 'cultural_program', 'tourism_festival',
      'new_year', 'corporate_event', 'hotel_event'
    ),
    allowNull: false,
  },
  date: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE },
  location: { type: DataTypes.STRING, allowNull: false },
  latitude: { type: DataTypes.FLOAT },
  longitude: { type: DataTypes.FLOAT },
  coverImage: { type: DataTypes.STRING },
  images: { type: DataTypes.JSON, defaultValue: [] },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected', 'suspended', 'cancelled'),
    defaultValue: 'pending',
  },
  totalCapacity: { type: DataTypes.INTEGER, defaultValue: 0 },
  availableSeats: { type: DataTypes.INTEGER, defaultValue: 0 },
  isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
  basePrice: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  organizerId: { type: DataTypes.UUID, allowNull: false },
  adminNote: { type: DataTypes.TEXT },
  viewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  tags: { type: DataTypes.JSON, defaultValue: [] },
});

const Ticket = sequelize.define('Ticket', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  eventId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  sold: { type: DataTypes.INTEGER, defaultValue: 0 },
  description: { type: DataTypes.STRING },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  saleStartDate: { type: DataTypes.DATE },
  saleEndDate: { type: DataTypes.DATE },
});

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  bookingRef: { type: DataTypes.STRING, unique: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  eventId: { type: DataTypes.UUID, allowNull: false },
  ticketId: { type: DataTypes.UUID, allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'refunded', 'attended'),
    defaultValue: 'pending',
  },
  qrCode: { type: DataTypes.TEXT },
  qrCodeData: { type: DataTypes.STRING },
  isScanned: { type: DataTypes.BOOLEAN, defaultValue: false },
  scannedAt: { type: DataTypes.DATE },
  notes: { type: DataTypes.TEXT },
});

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  bookingId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: 'BDT' },
  method: {
    type: DataTypes.ENUM('stripe', 'sslcommerz', 'bkash', 'nagad', 'cash'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  transactionId: { type: DataTypes.STRING },
  gatewayResponse: { type: DataTypes.JSON },
  refundAmount: { type: DataTypes.DECIMAL(10, 2) },
  refundReason: { type: DataTypes.TEXT },
  refundedAt: { type: DataTypes.DATE },
});

const OrganizerApplication = sequelize.define('OrganizerApplication', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  organizationName: { type: DataTypes.STRING, allowNull: false },
  organizationInfo: { type: DataTypes.TEXT },
  nationalId: { type: DataTypes.STRING },
  bankDetails: { type: DataTypes.JSON },
  documents: { type: DataTypes.JSON, defaultValue: [] },
  profilePhoto: { type: DataTypes.STRING },
  status: {
    type: DataTypes.ENUM('pending', 'under_review', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  adminNote: { type: DataTypes.TEXT },
  reviewedBy: { type: DataTypes.UUID },
  reviewedAt: { type: DataTypes.DATE },
});

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  type: {
    type: DataTypes.ENUM(
      'booking_confirmed', 'booking_cancelled', 'event_approved', 'event_rejected',
      'event_cancelled', 'refund_issued', 'new_booking', 'new_organizer_request', 'system_alert'
    ),
  },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  readAt: { type: DataTypes.DATE },
  link: { type: DataTypes.STRING },
  metadata: { type: DataTypes.JSON },
});

const Review = sequelize.define('Review', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  eventId: { type: DataTypes.UUID, allowNull: false },
  bookingId: { type: DataTypes.UUID },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  isHidden: { type: DataTypes.BOOLEAN, defaultValue: false },
});

// ─── ASSOCIATIONS ────────────────────────────────────────────────────────────
User.hasMany(Event, { foreignKey: 'organizerId', as: 'events' });
Event.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });
Event.hasMany(Ticket, { foreignKey: 'eventId', as: 'tickets' });
Ticket.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Event.hasMany(Booking, { foreignKey: 'eventId', as: 'bookings' });
Booking.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Ticket.hasMany(Booking, { foreignKey: 'ticketId', as: 'bookings' });
Booking.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });
Booking.hasOne(Payment, { foreignKey: 'bookingId', as: 'payment' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
User.hasOne(OrganizerApplication, { foreignKey: 'userId', as: 'application' });
OrganizerApplication.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Event.hasMany(Review, { foreignKey: 'eventId', as: 'reviews' });
Review.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// ─── EMAIL ───────────────────────────────────────────────────────────────────
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  await emailTransporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
};

const bookingConfirmationEmail = (user, booking, event, qrCode) => ({
  to: user.email,
  subject: `Booking Confirmed - ${event.title} | SeaFest BD`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="background:#0ea5e9;padding:20px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0">SeaFest BD</h1>
        <p style="color:#e0f2fe;margin:5px 0">Discover. Book. Celebrate.</p>
      </div>
      <div style="background:#f8fafc;padding:30px;border-radius:0 0 8px 8px">
        <h2 style="color:#1e293b">Booking Confirmed!</h2>
        <p>Hi <strong>${user.name}</strong>, your booking is confirmed.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Booking Ref</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:bold">${booking.bookingRef}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Event</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${event.title}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Date</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${new Date(event.date).toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Location</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${event.location}</td></tr>
          <tr><td style="padding:8px;color:#64748b">Amount Paid</td><td style="padding:8px;font-weight:bold;color:#0ea5e9">৳${booking.totalAmount}</td></tr>
        </table>
        <div style="text-align:center;margin:20px 0">
          <p style="color:#64748b">Show this QR code at the event entrance</p>
          <img src="${qrCode}" alt="QR Ticket" style="width:200px;height:200px" />
        </div>
        <p style="color:#94a3b8;font-size:12px;text-align:center">SeaFest BD — Cox's Bazar, Bangladesh</p>
      </div>
    </div>
  `,
});

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    if (!req.user || req.user.isSuspended)
      return res.status(401).json({ success: false, message: 'Account suspended or not found' });
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, message: 'Access denied' });
  next();
};

// ─── EXPRESS APP ─────────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── AUTH ROUTES ─────────────────────────────────────────────────────────────
const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, phone });
    res.status(201).json({
      success: true,
      token: signToken(user.id),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (user.isSuspended)
      return res.status(403).json({ success: false, message: 'Account suspended' });
    res.json({
      success: true,
      token: signToken(user.id),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

authRouter.get('/me', protect, (req, res) => res.json({ success: true, user: req.user }));

authRouter.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    await req.user.update({ name, phone });
    res.json({ success: true, user: req.user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

authRouter.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    await user.update({ password: newPassword });
    res.json({ success: true, message: 'Password updated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

authRouter.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const token = crypto.randomBytes(20).toString('hex');
    await user.update({ resetPasswordToken: token, resetPasswordExpire: new Date(Date.now() + 600000) });
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset - SeaFest BD',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 10 minutes.</p>`,
    });
    res.json({ success: true, message: 'Reset email sent' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

authRouter.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({ where: { resetPasswordToken: req.params.token } });
    if (!user || user.resetPasswordExpire < new Date())
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    await user.update({ password: req.body.password, resetPasswordToken: null, resetPasswordExpire: null });
    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.use('/api/auth', authRouter);

// ─── EVENTS ROUTES ────────────────────────────────────────────────────────────
const eventsRouter = express.Router();

eventsRouter.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12, sort = 'date' } = req.query;
    const where = { status: 'approved' };
    if (category) where.category = category;
    if (search) where.title = { [Op.like]: `%${search}%` };
    const offset = (page - 1) * limit;
    const { count, rows } = await Event.findAndCountAll({
      where,
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'avatar'] },
        { model: Ticket, as: 'tickets', where: { isActive: true }, required: false },
      ],
      order: [[sort === 'price' ? 'basePrice' : 'date', sort === 'price' ? 'ASC' : 'DESC']],
      limit: parseInt(limit), offset, distinct: true,
    });
    res.json({ success: true, total: count, page: parseInt(page), events: rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

eventsRouter.get('/featured', async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { status: 'approved', isFeatured: true },
      include: [{ model: User, as: 'organizer', attributes: ['id', 'name'] }],
      limit: 6, order: [['date', 'ASC']],
    });
    res.json({ success: true, events });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

eventsRouter.get('/my', protect, authorize('manager', 'admin'), async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { organizerId: req.user.id },
      include: [{ model: Ticket, as: 'tickets', required: false }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, events });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

eventsRouter.get('/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'avatar'] },
        { model: Ticket, as: 'tickets', where: { isActive: true }, required: false },
        { model: Review, as: 'reviews', where: { isHidden: false }, required: false,
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }] },
      ],
    });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    await event.increment('viewCount');
    res.json({ success: true, event });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

eventsRouter.post('/', protect, authorize('manager', 'admin'), async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizerId: req.user.id, status: 'pending' });
    res.status(201).json({ success: true, event });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

eventsRouter.post('/tickets', protect, authorize('manager', 'admin'), async (req, res) => {
  try {
    const ticket = await Ticket.create(req.body);
    res.status(201).json({ success: true, ticket });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

eventsRouter.put('/:id', protect, authorize('manager', 'admin'), async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizerId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await event.update(req.body);
    res.json({ success: true, event });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

eventsRouter.delete('/:id', protect, authorize('manager', 'admin'), async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizerId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await event.destroy();
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.use('/api/events', eventsRouter);

// ─── BOOKINGS ROUTES ──────────────────────────────────────────────────────────
const bookingsRouter = express.Router();
bookingsRouter.use(protect);

bookingsRouter.post('/', async (req, res) => {
  try {
    const { eventId, ticketId, quantity = 1 } = req.body;
    const [event, ticket] = await Promise.all([Event.findByPk(eventId), Ticket.findByPk(ticketId)]);
    if (!event || event.status !== 'approved')
      return res.status(400).json({ success: false, message: 'Event not available' });
    if (!ticket || ticket.eventId !== eventId)
      return res.status(400).json({ success: false, message: 'Invalid ticket' });
    if (ticket.quantity - ticket.sold < quantity)
      return res.status(400).json({ success: false, message: 'Not enough tickets available' });
    const totalAmount = ticket.price * quantity;
    const bookingRef = `SFB-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const qrData = JSON.stringify({ ref: bookingRef, event: event.id, user: req.user.id });
    const qrCode = await QRCode.toDataURL(qrData);
    const booking = await Booking.create({
      bookingRef, userId: req.user.id, eventId, ticketId, quantity, totalAmount, qrCode, qrCodeData: qrData, status: 'pending',
    });
    await ticket.increment('sold', { by: quantity });
    await Notification.create({
      userId: req.user.id, type: 'booking_confirmed',
      title: 'Booking Created',
      message: `Your booking for ${event.title} has been created. Complete payment to confirm.`,
      link: `/bookings/${booking.id}`,
    });
    res.status(201).json({ success: true, booking });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

bookingsRouter.get('/', async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [{ model: Event, as: 'event' }, { model: Ticket, as: 'ticket' }, { model: Payment, as: 'payment' }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, bookings });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

bookingsRouter.get('/manager/sold', authorize('manager', 'admin'), async (req, res) => {
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
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

bookingsRouter.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Event, as: 'event' }, { model: Ticket, as: 'ticket' }, { model: Payment, as: 'payment' }],
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

bookingsRouter.put('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!['pending', 'confirmed'].includes(booking.status))
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
    await booking.update({ status: 'cancelled' });
    await Ticket.findByPk(booking.ticketId).then(t => t?.decrement('sold', { by: booking.quantity }));
    res.json({ success: true, message: 'Booking cancelled' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

bookingsRouter.post('/scan', authorize('manager', 'admin'), async (req, res) => {
  try {
    const parsed = JSON.parse(req.body.qrData);
    const booking = await Booking.findOne({
      where: { bookingRef: parsed.ref },
      include: [{ model: Event, as: 'event' }, { model: User, as: 'user', attributes: ['name', 'email'] }],
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.isScanned) return res.status(400).json({ success: false, message: 'Ticket already scanned' });
    if (booking.status !== 'confirmed') return res.status(400).json({ success: false, message: 'Booking not confirmed' });
    await booking.update({ isScanned: true, scannedAt: new Date(), status: 'attended' });
    res.json({ success: true, message: 'Entry verified', booking });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.use('/api/bookings', bookingsRouter);

// ─── PAYMENTS ROUTES ──────────────────────────────────────────────────────────
const paymentsRouter = express.Router();
paymentsRouter.use(protect);

paymentsRouter.post('/stripe/intent', async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.body.bookingId, userId: req.user.id },
      include: [{ model: Event, as: 'event' }],
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100),
      currency: 'usd',
      metadata: { bookingId: booking.id, userId: req.user.id },
    });
    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

paymentsRouter.post('/confirm', async (req, res) => {
  try {
    const { bookingId, method, transactionId } = req.body;
    const booking = await Booking.findOne({
      where: { id: bookingId, userId: req.user.id },
      include: [{ model: Event, as: 'event' }, { model: Ticket, as: 'ticket' }],
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    const payment = await Payment.create({
      bookingId, userId: req.user.id, amount: booking.totalAmount, method, status: 'completed', transactionId,
    });
    await booking.update({ status: 'confirmed' });
    const user = await User.findByPk(req.user.id);
    const emailData = bookingConfirmationEmail(user, booking, booking.event, booking.qrCode);
    await sendEmail(emailData).catch(() => {});
    await Notification.create({
      userId: req.user.id, type: 'booking_confirmed',
      title: 'Payment Successful',
      message: `Payment confirmed for ${booking.event.title}. Your QR ticket is ready.`,
      link: `/bookings/${booking.id}`,
    });
    res.json({ success: true, payment, booking });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

paymentsRouter.post('/refund', authorize('admin'), async (req, res) => {
  try {
    const { bookingId, reason } = req.body;
    const booking = await Booking.findByPk(bookingId, { include: [{ model: Payment, as: 'payment' }] });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    await booking.payment.update({
      status: 'refunded', refundAmount: booking.payment.amount, refundReason: reason, refundedAt: new Date(),
    });
    await booking.update({ status: 'refunded' });
    await Ticket.findByPk(booking.ticketId).then(t => t?.decrement('sold', { by: booking.quantity }));
    await Notification.create({
      userId: booking.userId, type: 'refund_issued',
      title: 'Refund Issued',
      message: `A refund of ৳${booking.payment.amount} has been processed.`,
    });
    res.json({ success: true, message: 'Refund processed' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.use('/api/payments', paymentsRouter);

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────
const adminRouter = express.Router();
adminRouter.use(protect, authorize('admin'));

adminRouter.get('/dashboard', async (req, res) => {
  try {
    const [totalUsers, totalEvents, totalBookings, revenueResult, pendingEvents, pendingApplications] =
      await Promise.all([
        User.count(),
        Event.count({ where: { status: 'approved' } }),
        Booking.count({ where: { status: 'confirmed' } }),
        Payment.sum('amount', { where: { status: 'completed' } }),
        Event.count({ where: { status: 'pending' } }),
        OrganizerApplication.count({ where: { status: 'pending' } }),
      ]);
    const todaySales = await Payment.sum('amount', {
      where: { status: 'completed', createdAt: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) } },
    });
    res.json({
      success: true,
      stats: { totalUsers, totalEvents, totalBookings, totalRevenue: revenueResult || 0, todaySales: todaySales || 0, pendingEvents, pendingApplications },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

adminRouter.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const where = {};
    if (search) where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }];
    if (role) where.role = role;
    const { count, rows } = await User.findAndCountAll({
      where, attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']], limit: parseInt(limit), offset: (page - 1) * limit,
    });
    res.json({ success: true, total: count, users: rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

adminRouter.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.update(req.body);
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

adminRouter.delete('/users/:id', async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

adminRouter.get('/events', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};
    const { count, rows } = await Event.findAndCountAll({
      where,
      include: [{ model: User, as: 'organizer', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']], limit: parseInt(limit), offset: (page - 1) * limit,
    });
    res.json({ success: true, total: count, events: rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

adminRouter.put('/events/:id/status', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    await event.update({ status: req.body.status, adminNote: req.body.note });
    await Notification.create({
      userId: event.organizerId,
      type: req.body.status === 'approved' ? 'event_approved' : 'event_rejected',
      title: `Event ${req.body.status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your event "${event.title}" has been ${req.body.status}.`,
      link: `/manager/events/${event.id}`,
    });
    res.json({ success: true, event });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

adminRouter.get('/applications', async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const applications = await OrganizerApplication.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, applications });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

adminRouter.put('/applications/:id', async (req, res) => {
  try {
    const appRecord = await OrganizerApplication.findByPk(req.params.id);
    if (!appRecord) return res.status(404).json({ success: false, message: 'Application not found' });
    const { status, note } = req.body;
    await appRecord.update({ status, adminNote: note, reviewedBy: req.user.id, reviewedAt: new Date() });
    if (status === 'approved') await User.update({ role: 'manager' }, { where: { id: appRecord.userId } });
    await Notification.create({
      userId: appRecord.userId, type: 'system_alert',
      title: `Organizer Application ${status}`,
      message: `Your organizer application has been ${status}. ${note || ''}`,
    });
    res.json({ success: true, application: appRecord });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

adminRouter.get('/revenue', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const format = period === 'monthly' ? '%Y-%m' : '%Y-%m-%d';
    const data = await Payment.findAll({
      where: { status: 'completed' },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), format), 'period'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactions'],
      ],
      group: ['period'], order: [['period', 'ASC']], raw: true,
    });
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.use('/api/admin', adminRouter);

// ─── ORGANIZER ROUTES ─────────────────────────────────────────────────────────
const organizerRouter = express.Router();
organizerRouter.use(protect);

organizerRouter.post('/apply', async (req, res) => {
  try {
    const existing = await OrganizerApplication.findOne({ where: { userId: req.user.id } });
    if (existing) return res.status(400).json({ success: false, message: 'Application already submitted' });
    const appRecord = await OrganizerApplication.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, application: appRecord });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

organizerRouter.get('/my-application', async (req, res) => {
  try {
    const appRecord = await OrganizerApplication.findOne({ where: { userId: req.user.id } });
    res.json({ success: true, application: appRecord });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.use('/api/organizer', organizerRouter);

// ─── NOTIFICATIONS ROUTES ─────────────────────────────────────────────────────
const notificationsRouter = express.Router();
notificationsRouter.use(protect);

notificationsRouter.get('/', async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']], limit: 50,
    });
    res.json({ success: true, notifications });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

notificationsRouter.put('/:id/read', async (req, res) => {
  try {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { id: req.params.id, userId: req.user.id } }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

notificationsRouter.put('/read-all', async (req, res) => {
  try {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId: req.user.id, isRead: false } }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.use('/api/notifications', notificationsRouter);

// ─── HEALTH + ERROR ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'SeaFest BD API running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: process.env.NODE_ENV === 'development' }).then(() => {
  app.listen(PORT, () => console.log(`SeaFest BD server running on port ${PORT}`));
}).catch(err => {
  console.error('DB connection failed:', err.message);
  process.exit(1);
});
