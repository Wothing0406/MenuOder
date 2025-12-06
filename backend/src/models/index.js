// Import all models
const Store = require('./Store');
const Category = require('./Category');
const Item = require('./Item');
const ItemOption = require('./ItemOption');
const ItemAccompaniment = require('./ItemAccompaniment');
const User = require('./User');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Voucher = require('./Voucher');
const Review = require('./Review');

// Define associations
Store.hasMany(Category, {
  foreignKey: 'storeId',
  as: 'categories'
});
Category.belongsTo(Store, {
  foreignKey: 'storeId',
  as: 'store'
});

Category.hasMany(Item, {
  foreignKey: 'categoryId',
  as: 'items'
});
Item.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

Store.hasMany(Item, {
  foreignKey: 'storeId',
  as: 'allItems'
});
Item.belongsTo(Store, {
  foreignKey: 'storeId',
  as: 'store'
});

Item.hasMany(ItemOption, {
  foreignKey: 'itemId',
  as: 'options'
});
ItemOption.belongsTo(Item, {
  foreignKey: 'itemId',
  as: 'item'
});

Item.hasMany(ItemAccompaniment, {
  foreignKey: 'itemId',
  as: 'accompaniments'
});
ItemAccompaniment.belongsTo(Item, {
  foreignKey: 'itemId',
  as: 'item'
});

User.hasMany(Store, {
  foreignKey: 'userId',
  as: 'stores'
});
Store.belongsTo(User, {
  foreignKey: 'userId',
  as: 'owner'
});

Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items'
});
OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order'
});

Item.hasMany(OrderItem, {
  foreignKey: 'itemId',
  as: 'orderItems'
});
OrderItem.belongsTo(Item, {
  foreignKey: 'itemId',
  as: 'item'
});

Store.hasMany(Order, {
  foreignKey: 'storeId',
  as: 'orders'
});
Order.belongsTo(Store, {
  foreignKey: 'storeId',
  as: 'store'
});

Store.hasMany(Voucher, {
  foreignKey: 'storeId',
  as: 'vouchers'
});
Voucher.belongsTo(Store, {
  foreignKey: 'storeId',
  as: 'store'
});

Voucher.hasMany(Order, {
  foreignKey: 'voucherId',
  as: 'orders'
});
Order.belongsTo(Voucher, {
  foreignKey: 'voucherId',
  as: 'voucher'
});

Store.hasMany(Review, {
  foreignKey: 'storeId',
  as: 'reviews'
});
Review.belongsTo(Store, {
  foreignKey: 'storeId',
  as: 'store'
});

Item.hasMany(Review, {
  foreignKey: 'itemId',
  as: 'reviews'
});
Review.belongsTo(Item, {
  foreignKey: 'itemId',
  as: 'item'
});

Order.hasMany(Review, {
  foreignKey: 'orderId',
  as: 'reviews'
});
Review.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order'
});

module.exports = {
  Store,
  Category,
  Item,
  ItemOption,
  ItemAccompaniment,
  User,
  Order,
  OrderItem,
  Voucher,
  Review
};
