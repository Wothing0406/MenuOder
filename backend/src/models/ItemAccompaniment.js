const { sequelize, Sequelize } = require('../config/database');

const ItemAccompaniment = sequelize.define('ItemAccompaniment', {
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
  accompanimentName: {
    type: Sequelize.STRING,
    allowNull: false,
    comment: 'Name of the side dish (e.g., "Cơm", "Nước")'
  },
  accompanimentPrice: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  isOptional: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
    comment: 'Whether customer can skip this accompaniment'
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
  tableName: 'item_accompaniments',
  timestamps: true
});

module.exports = ItemAccompaniment;
