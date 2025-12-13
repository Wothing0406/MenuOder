const { sequelize, Sequelize } = require('../config/database');

const PaymentAccount = sequelize.define('PaymentAccount', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  storeId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'stores',
      key: 'id'
    }
  },
  accountType: {
    type: Sequelize.ENUM('bank_transfer', 'zalopay'),
    allowNull: false
  },
  accountName: {
    type: Sequelize.STRING,
    allowNull: false,
    comment: 'Display name for this account'
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  isDefault: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    comment: 'Default account for this payment type'
  },
  
  // Bank Transfer fields
  bankAccountNumber: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  bankAccountName: {
    type: Sequelize.STRING(200),
    allowNull: true
  },
  bankName: {
    type: Sequelize.STRING(100),
    allowNull: true
  },
  bankCode: {
    type: Sequelize.STRING(10),
    allowNull: true
  },
  
  // ZaloPay fields
  zaloPayAppId: {
    type: Sequelize.STRING(100),
    allowNull: true
  },
  zaloPayKey1: {
    type: Sequelize.STRING(200),
    allowNull: true
  },
  zaloPayKey2: {
    type: Sequelize.STRING(200),
    allowNull: true
  },
  zaloPayMerchantId: {
    type: Sequelize.STRING(100),
    allowNull: true
  },
  
  // Verification status
  isVerified: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    comment: 'Whether account has been verified'
  },
  verifiedAt: {
    type: Sequelize.DATE,
    allowNull: true
  },
  verificationError: {
    type: Sequelize.TEXT,
    allowNull: true
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
  tableName: 'payment_accounts',
  timestamps: true,
  indexes: [
    {
      fields: ['storeId', 'accountType']
    },
    {
      fields: ['storeId', 'isActive']
    }
  ]
});

module.exports = PaymentAccount;