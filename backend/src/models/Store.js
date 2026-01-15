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
  storeDetailedAddress: {
    type: Sequelize.TEXT,
    allowNull: true,
    comment: 'Detailed address for display (does not affect distance calculation)'
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
  // ZaloPay configuration
  zaloPayAppId: {
    type: Sequelize.STRING(100),
    allowNull: true,
    comment: 'ZaloPay App ID'
  },
  zaloPayKey1: {
    type: Sequelize.STRING(200),
    allowNull: true,
    comment: 'ZaloPay Key 1'
  },
  zaloPayKey2: {
    type: Sequelize.STRING(200),
    allowNull: true,
    comment: 'ZaloPay Key 2'
  },
  zaloPayMerchantId: {
    type: Sequelize.STRING(100),
    allowNull: true,
    comment: 'ZaloPay Merchant ID (optional)'
  },
  zaloPayIsActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    comment: 'Enable ZaloPay for this store'
  },
  zaloPayLink: {
    type: Sequelize.STRING(500),
    allowNull: true,
    comment: 'ZaloPay payment link (optional/manual)'
  },
  // Note: Bank transfer fields have been moved to payment_accounts table
  // Do not add bank transfer fields here anymore
  is_open: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
    comment: 'Trạng thái mở/đóng của quán - true: mở, false: đóng'
  },
  isBusyModeEnabled: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    comment: 'Enable/disable busy mode manually'
  },
  maxOrdersPerWindow: {
    type: Sequelize.INTEGER,
    defaultValue: 20,
    comment: 'Maximum orders per time window before auto busy mode'
  },
  timeWindowMinutes: {
    type: Sequelize.INTEGER,
    defaultValue: 15,
    comment: 'Time window in minutes for order counting'
  },
  busyModeStartTime: {
    type: Sequelize.DATE,
    allowNull: true,
    comment: 'When busy mode was automatically activated'
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