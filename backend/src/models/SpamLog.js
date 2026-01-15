const { sequelize, Sequelize } = require('../config/database');

const SpamLog = sequelize.define('SpamLog', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ip: {
    type: Sequelize.STRING(45),
    allowNull: true,
    comment: 'IP address involved'
  },
  deviceId: {
    type: Sequelize.STRING(255),
    allowNull: true,
    comment: 'Device ID involved'
  },
  storeId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    comment: 'Store ID targeted'
  },
  action: {
    type: Sequelize.STRING(100),
    allowNull: false,
    comment: 'Type of action: rate_limit_exceeded, device_spam_attempt, etc.'
  },
  details: {
    type: Sequelize.JSON,
    allowNull: true,
    comment: 'Additional details about the incident'
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'spam_logs',
  timestamps: false, // Only createdAt, no updatedAt
  indexes: [
    { fields: ['ip'] },
    { fields: ['deviceId'] },
    { fields: ['storeId'] },
    { fields: ['action'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = SpamLog;
