const { sequelize, Sequelize } = require('../config/database');

const Store = sequelize.define('Store', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  storeName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  storeSlug: {
    type: Sequelize.STRING,
    unique: true,
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
  storeGoogleMapLink: {
    type: Sequelize.STRING(500),
    allowNull: true,
    comment: 'Google Maps link for the store location'
  },
  storeDescription: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  storeLogo: {
    type: Sequelize.STRING,
    allowNull: true
  },
  storeImage: {
    type: Sequelize.STRING,
    allowNull: true
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
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
  tableName: 'stores',
  timestamps: true
});

module.exports = Store;
