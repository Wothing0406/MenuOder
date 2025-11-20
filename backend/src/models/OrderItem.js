const { sequelize, Sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  itemId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'items',
      key: 'id'
    }
  },
  itemName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  itemPrice: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  selectedOptions: {
    type: Sequelize.JSON,
    allowNull: true,
    comment: 'JSON array of selected options'
  },
  selectedAccompaniments: {
    type: Sequelize.JSON,
    allowNull: true,
    comment: 'JSON array of selected accompaniments'
  },
  notes: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  subtotal: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
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
  tableName: 'order_items',
  timestamps: true
});

module.exports = OrderItem;
