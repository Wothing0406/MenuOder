const { sequelize, Sequelize } = require('../config/database');

const BlockedIP = sequelize.define('BlockedIP', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ip: {
    type: Sequelize.STRING(45),
    allowNull: false,
    unique: true,
    comment: 'IPv4 or IPv6 address'
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
  tableName: 'blocked_ips',
  timestamps: true,
  indexes: [
    { fields: ['ip'] },
    { fields: ['blockedUntil'] }
  ]
});

module.exports = BlockedIP;
