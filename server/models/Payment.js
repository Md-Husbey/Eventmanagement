const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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

module.exports = Payment;
