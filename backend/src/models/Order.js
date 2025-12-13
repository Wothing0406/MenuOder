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
    allowNull: true,
    comment: 'Customer name (required for delivery orders, optional for dine-in)'
  },
  customerPhone: {
    type: Sequelize.STRING,
    allowNull: true,
    comment: 'Customer phone (required for delivery orders, optional for dine-in)'
  },
  customerEmail: {
    type: Sequelize.STRING,
    allowNull: true
  },
  customerNote: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  orderType: {
    type: Sequelize.ENUM('dine_in', 'delivery'),
    allowNull: false,
    defaultValue: 'dine_in',
    comment: 'Type of order: dine_in or delivery'
  },
  deliveryAddress: {
    type: Sequelize.TEXT,
    allowNull: true,
    comment: 'Delivery address for delivery orders'
  },
  deliveryDistance: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Delivery distance in kilometers'
  },
  shippingFee: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Shipping fee in VND'
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
    type: Sequelize.ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'),
    defaultValue: 'pending',
    comment: 'Order status: pending, confirmed, preparing, ready, delivered, completed (paid), cancelled'
  },
  paymentMethod: {
    type: Sequelize.ENUM('cash', 'bank_transfer', 'credit_card', 'zalopay_qr', 'bank_transfer_qr'),
    defaultValue: 'cash'
  },
  paymentAccountId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'payment_accounts',
      key: 'id'
    },
    comment: 'Reference to payment account used for this order'
  },
  isPaid: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  // ZaloPay fields
  zaloPayTransactionId: {
    type: Sequelize.STRING(100),
    allowNull: true,
    comment: 'ZaloPay transaction ID (app_trans_id)'
  },
  zaloPayStatus: {
    type: Sequelize.ENUM('pending', 'success', 'failed'),
    allowNull: true,
    comment: 'ZaloPay transaction status'
  },
  zaloPayQrCode: {
    type: Sequelize.TEXT,
    allowNull: true,
    comment: 'ZaloPay QR code data (URL or image data)'
  },
  bankTransferQRCode: {
    type: Sequelize.TEXT,
    allowNull: true,
    comment: 'Bank Transfer QR code data (image data)'
  },
  voucherId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'vouchers',
      key: 'id'
    }
  },
  voucherCode: {
    type: Sequelize.STRING(100),
    allowNull: true
  },
  discountType: {
    type: Sequelize.ENUM('percentage', 'fixed'),
    allowNull: true
  },
  discountValue: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true
  },
  discountAmount: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
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
  tableName: 'orders',
  timestamps: true
});

module.exports = Order;