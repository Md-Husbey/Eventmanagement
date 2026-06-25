const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrganizerApplication = sequelize.define('OrganizerApplication', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  organizationName: { type: DataTypes.STRING, allowNull: false },
  organizationInfo: { type: DataTypes.TEXT },
  nationalId: { type: DataTypes.STRING },
  bankDetails: { type: DataTypes.JSON },
  documents: { type: DataTypes.JSON, defaultValue: [] }, // array of cloudinary URLs
  profilePhoto: { type: DataTypes.STRING },
  status: {
    type: DataTypes.ENUM('pending', 'under_review', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  adminNote: { type: DataTypes.TEXT },
  reviewedBy: { type: DataTypes.UUID },
  reviewedAt: { type: DataTypes.DATE },
});

module.exports = OrganizerApplication;
