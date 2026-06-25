const { Op } = require('sequelize');
const { User, Event, Booking, Payment, OrganizerApplication, Notification } = require('../models');
const sequelize = require('../config/database');

exports.getDashboardStats = async (req, res) => {
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
      where: {
        status: 'completed',
        createdAt: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalEvents,
        totalBookings,
        totalRevenue: revenueResult || 0,
        todaySales: todaySales || 0,
        pendingEvents,
        pendingApplications,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const where = {};
    if (search) where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }];
    if (role) where.role = role;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });
    res.json({ success: true, total: count, users: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { role, isActive, isSuspended } = req.body;
    await user.update({ role, isActive, isSuspended });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};
    const { count, rows } = await Event.findAndCountAll({
      where,
      include: [{ model: User, as: 'organizer', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });
    res.json({ success: true, total: count, events: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveEvent = async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrganizerApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const applications = await OrganizerApplication.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reviewApplication = async (req, res) => {
  try {
    const app = await OrganizerApplication.findByPk(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    const { status, note } = req.body;
    await app.update({ status, adminNote: note, reviewedBy: req.user.id, reviewedAt: new Date() });

    if (status === 'approved') {
      await User.update({ role: 'manager' }, { where: { id: app.userId } });
    }

    await Notification.create({
      userId: app.userId,
      type: 'system_alert',
      title: `Organizer Application ${status}`,
      message: `Your organizer application has been ${status}. ${note || ''}`,
    });

    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRevenueReport = async (req, res) => {
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
      group: ['period'],
      order: [['period', 'ASC']],
      raw: true,
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
