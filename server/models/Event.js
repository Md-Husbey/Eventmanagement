const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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

module.exports = Event;
