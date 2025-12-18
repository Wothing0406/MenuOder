const { sequelize, Sequelize } = require('../config/database');

const Item = sequelize.define('Item', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  categoryId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  storeId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'stores',
      key: 'id'
    }
  },
  itemName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  itemDescription: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  itemPrice: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  },
  // null  => không giới hạn, coi như còn hàng
  // 0     => hết hàng
  // > 0   => còn X phần (số lượng tối đa có thể bán thêm)
  remainingStock: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  itemImage: {
    type: Sequelize.STRING,
    allowNull: true
  },
  isAvailable: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  displayOrder: {
    type: Sequelize.INTEGER,
    defaultValue: 0
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
  tableName: 'items',
  timestamps: true
});

module.exports = Item;
