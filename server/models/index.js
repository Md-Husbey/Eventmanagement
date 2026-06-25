const sequelize = require('../config/database');
const User = require('./User');
const Event = require('./Event');
const Ticket = require('./Ticket');
const Booking = require('./Booking');
const Payment = require('./Payment');
const OrganizerApplication = require('./OrganizerApplication');
const Notification = require('./Notification');
const Review = require('./Review');

// User — Event (organizer)
User.hasMany(Event, { foreignKey: 'organizerId', as: 'events' });
Event.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });

// Event — Tickets
Event.hasMany(Ticket, { foreignKey: 'eventId', as: 'tickets' });
Ticket.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// User — Bookings
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Event — Bookings
Event.hasMany(Booking, { foreignKey: 'eventId', as: 'bookings' });
Booking.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// Ticket — Bookings
Ticket.hasMany(Booking, { foreignKey: 'ticketId', as: 'bookings' });
Booking.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });

// Booking — Payment
Booking.hasOne(Payment, { foreignKey: 'bookingId', as: 'payment' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// User — OrganizerApplication
User.hasOne(OrganizerApplication, { foreignKey: 'userId', as: 'application' });
OrganizerApplication.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User — Notifications
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User — Reviews
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Event — Reviews
Event.hasMany(Review, { foreignKey: 'eventId', as: 'reviews' });
Review.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

module.exports = { sequelize, User, Event, Ticket, Booking, Payment, OrganizerApplication, Notification, Review };
