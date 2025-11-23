const { sequelize, Sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
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
  categoryName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  categoryDescription: {
    type: Sequelize.TEXT,
    allowNull: true
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
  tableName: 'categories',
  timestamps: true
});

module.exports = Category;
