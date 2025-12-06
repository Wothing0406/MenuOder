const { sequelize, Sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  storeName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  storePhone: {
    type: Sequelize.STRING,
    allowNull: true
  },
  storeAddress: {
    type: Sequelize.STRING,
    allowNull: true
  },
  role: {
    type: Sequelize.ENUM('store_owner', 'admin'),
    allowNull: false,
    defaultValue: 'store_owner'
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
  tableName: 'users',
  timestamps: true
});

module.exports = User;
