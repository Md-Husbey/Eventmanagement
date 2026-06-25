const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  eventId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false }, // VIP, General, Early Bird, etc.
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  sold: { type: DataTypes.INTEGER, defaultValue: 0 },
  description: { type: DataTypes.STRING },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  saleStartDate: { type: DataTypes.DATE },
  saleEndDate: { type: DataTypes.DATE },
});

module.exports = Ticket;
