const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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

module.exports = Notification;
