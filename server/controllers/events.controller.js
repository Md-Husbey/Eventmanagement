const { Op } = require('sequelize');
const { Event, Ticket, User, Review, Booking } = require('../models');

exports.getEvents = async (req, res) => {
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
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    res.json({ success: true, total: count, page: parseInt(page), events: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'avatar'] },
        { model: Ticket, as: 'tickets', where: { isActive: true }, required: false },
        {
          model: Review, as: 'reviews', where: { isHidden: false }, required: false,
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
        },
      ],
    });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    await event.increment('viewCount');
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizerId: req.user.id, status: 'pending' });
    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await event.update(req.body);
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await event.destroy();
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { organizerId: req.user.id },
      include: [{ model: Ticket, as: 'tickets', required: false }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { status: 'approved', isFeatured: true },
      include: [{ model: User, as: 'organizer', attributes: ['id', 'name'] }],
      limit: 6,
      order: [['date', 'ASC']],
    });
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
