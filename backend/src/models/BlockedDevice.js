const { sequelize, Sequelize } = require('../config/database');

const BlockedDevice = sequelize.define('BlockedDevice', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  deviceId: {
    type: Sequelize.STRING(255),
    allowNull: false,
    unique: true,
    comment: 'Device UUID'
  },
  reason: {
    type: Sequelize.STRING(255),
    allowNull: true,
    comment: 'Reason for blocking'
  },
  blockedUntil: {
    type: Sequelize.DATE,
    allowNull: true,
    comment: 'When the block expires, NULL for permanent'
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'blocked_devices',
  timestamps: true,
  indexes: [
    { fields: ['deviceId'] },
    { fields: ['blockedUntil'] }
  ]
});

module.exports = BlockedDevice;
