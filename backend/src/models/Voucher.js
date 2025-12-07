const { sequelize, Sequelize } = require('../config/database');

const Voucher = sequelize.define('Voucher', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  storeId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'stores',
      key: 'id'
    }
  },
  code: {
    type: Sequelize.STRING(100),
    allowNull: false
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  discountType: {
    type: Sequelize.ENUM('percentage', 'fixed'),
    allowNull: false,
    defaultValue: 'percentage'
  },
  discountValue: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  },
  minOrderAmount: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  maxDiscountAmount: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true
  },
  usageLimit: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  usageCount: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  startsAt: {
    type: Sequelize.DATE,
    allowNull: true
  },
  expiresAt: {
    type: Sequelize.DATE,
    allowNull: true
  },
  neverExpires: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  createdBy: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
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
  tableName: 'vouchers',
  timestamps: true,
  indexes: [
    {
      name: 'idx_voucher_code',
      unique: false,
      fields: ['code']
    },
    {
      name: 'idx_voucher_store_code',
      unique: true,
      fields: ['storeId', 'code']
    }
  ]
});

module.exports = Voucher;





