const { sequelize, Sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
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
  orderCode: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  customerName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  customerPhone: {
    type: Sequelize.STRING,
    allowNull: false
  },
  customerEmail: {
    type: Sequelize.STRING,
    allowNull: true
  },
  customerNote: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  tableNumber: {
    type: Sequelize.INTEGER,
    allowNull: true,
    comment: 'Table number for dine-in orders'
  },
  totalAmount: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: Sequelize.ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: Sequelize.ENUM('cash', 'bank_transfer', 'credit_card'),
    defaultValue: 'cash'
  },
  isPaid: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
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
  tableName: 'orders',
  timestamps: true
});

module.exports = Order;
