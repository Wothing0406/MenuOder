const { sequelize, Sequelize } = require('../config/database');

const ItemOption = sequelize.define('ItemOption', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  itemId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'items',
      key: 'id'
    }
  },
  optionName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  optionType: {
    type: Sequelize.ENUM('select', 'multiselect', 'text'),
    defaultValue: 'select'
  },
  optionValues: {
    type: Sequelize.JSON,
    allowNull: true,
    comment: 'JSON array of option values with prices'
  },
  isRequired: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
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
  tableName: 'item_options',
  timestamps: true
});

module.exports = ItemOption;
