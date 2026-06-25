const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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

module.exports = Booking;
