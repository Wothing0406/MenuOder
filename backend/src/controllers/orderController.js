const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Store = require('../models/Store');
const Item = require('../models/Item');
const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

// Generate order code
const generateOrderCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// Create order (public - no auth needed)
exports.createOrder = async (req, res) => {
  try {
    const { storeId, tableNumber, customerName, customerPhone, customerEmail, customerNote, items } = req.body;

    console.log('Order creation request:', { storeId, tableNumber, customerName, customerPhone, itemsCount: items?.length });

    // Validation
    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required'
      });
    }
    
    if (!customerName || (typeof customerName === 'string' && customerName.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Tên khách hàng là bắt buộc'
      });
    }
    
    if (!customerPhone || (typeof customerPhone === 'string' && customerPhone.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại là bắt buộc'
      });
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất một món'
      });
    }

    // Validate tableNumber if provided
    let tableNum = null;
    if (tableNumber !== undefined && tableNumber !== null && tableNumber !== '') {
      const parsed = parseInt(String(tableNumber).trim());
      if (isNaN(parsed) || parsed < 1) {
        return res.status(400).json({
          success: false,
          message: 'Số bàn phải là số nguyên dương'
        });
      }
      tableNum = parsed;
    }

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Calculate total and create order items
    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of items) {
      const item = await Item.findByPk(cartItem.itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: `Item ${cartItem.itemId} not found`
        });
      }
      let price = parseFloat(item.itemPrice || 0);
      
      // Add accompaniments price
      if (cartItem.selectedAccompaniments && Array.isArray(cartItem.selectedAccompaniments)) {
        cartItem.selectedAccompaniments.forEach(acc => {
          if (acc.price) {
            price += parseFloat(acc.price);
          }
        });
      }
      
      const qty = parseInt(cartItem.quantity || 1, 10);
      const itemSubtotal = parseFloat((price * qty).toFixed(2));
      totalAmount += itemSubtotal;

      orderItems.push({
        itemId: item.id,
        itemName: item.itemName,
        itemPrice: price,
        quantity: qty,
        selectedOptions: cartItem.selectedOptions || [],
        selectedAccompaniments: cartItem.selectedAccompaniments || [],
        notes: cartItem.notes || '',
        subtotal: itemSubtotal
      });
    }

    // Create order
    const orderData = {
      storeId: parseInt(storeId),
      tableNumber: tableNum,
      orderCode: generateOrderCode(),
      customerName: typeof customerName === 'string' ? customerName.trim() : customerName,
      customerPhone: typeof customerPhone === 'string' ? customerPhone.trim() : customerPhone,
      customerEmail: customerEmail && typeof customerEmail === 'string' ? customerEmail.trim() : (customerEmail || null),
      customerNote: customerNote && typeof customerNote === 'string' ? customerNote.trim() : (customerNote || null),
      paymentMethod: req.body.paymentMethod || 'cash',
      totalAmount: parseFloat(totalAmount.toFixed(2))
    };
    
    console.log('Creating order with data:', orderData);
    
    const order = await Order.create(orderData);

    // Create order items
    try {
      for (const orderItem of orderItems) {
        await OrderItem.create({
          orderId: order.id,
          itemId: orderItem.itemId,
          itemName: orderItem.itemName,
          itemPrice: orderItem.itemPrice,
          quantity: orderItem.quantity,
          selectedOptions: orderItem.selectedOptions || null,
          selectedAccompaniments: orderItem.selectedAccompaniments || null,
          notes: orderItem.notes || null,
          subtotal: orderItem.subtotal
        });
      }
    } catch (itemError) {
      console.error('Error creating order items:', itemError);
      // Rollback order if items creation fails
      await order.destroy();
      return res.status(500).json({
        success: false,
        message: 'Failed to create order items',
        error: itemError.message
      });
    }

    // Fetch complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: { association: 'items' }
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: completeOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    
    // More detailed error messages
    let errorMessage = 'Không thể tạo đơn hàng';
    if (error.name === 'SequelizeValidationError') {
      errorMessage = 'Dữ liệu không hợp lệ: ' + error.errors.map(e => e.message).join(', ');
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      errorMessage = 'Mã đơn hàng đã tồn tại, vui lòng thử lại';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
};

// Get my store orders (authenticated)
exports.getMyStoreOrders = async (req, res) => {
  try {
    const store = await Store.findOne({
      where: { userId: req.user.id }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let where = { storeId: store.id };
    if (status) {
      where.status = status;
    }

    const orders = await Order.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Order.count({ where });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message
    });
  }
};

// Get order detail
exports.getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: { association: 'items' }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order',
      error: error.message
    });
  }
};

// Update order status (authenticated - only store owner)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, isPaid } = req.body;

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check ownership
    const store = await Store.findOne({
      where: { userId: req.user.id }
    });

    if (order.storeId !== store.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    await order.update({
      status: status || order.status,
      isPaid: isPaid !== undefined ? isPaid : order.isPaid
    });

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
};

// Get order statistics (authenticated)
exports.getOrderStats = async (req, res) => {
  try {
    const store = await Store.findOne({
      where: { userId: req.user.id }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get total orders
    const totalOrders = await Order.count({ where: { storeId: store.id } });
    
    // Get pending orders
    const pendingOrders = await Order.count({
      where: { storeId: store.id, status: 'pending' }
    });
    
    // Get completed orders
    const completedOrders = await Order.count({
      where: { storeId: store.id, status: 'delivered' }
    });

    // Calculate total revenue (all delivered orders)
    const totalRevenueResult = await Order.findAll({
      attributes: [[Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'total']],
      where: { 
        storeId: store.id, 
        status: 'delivered' 
      },
      raw: true
    });

    // Calculate monthly revenue (delivered orders this month)
    const monthlyRevenueResult = await Order.findAll({
      attributes: [[Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'total']],
      where: { 
        storeId: store.id, 
        status: 'delivered',
        createdAt: {
          [Op.gte]: startOfMonth
        }
      },
      raw: true
    });

    // Calculate yearly revenue (delivered orders this year)
    const yearlyRevenueResult = await Order.findAll({
      attributes: [[Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'total']],
      where: { 
        storeId: store.id, 
        status: 'delivered',
        createdAt: {
          [Op.gte]: startOfYear
        }
      },
      raw: true
    });

    const stats = {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenueResult && totalRevenueResult[0] && totalRevenueResult[0].total 
        ? parseFloat(totalRevenueResult[0].total) 
        : 0,
      monthlyRevenue: monthlyRevenueResult && monthlyRevenueResult[0] && monthlyRevenueResult[0].total 
        ? parseFloat(monthlyRevenueResult[0].total) 
        : 0,
      yearlyRevenue: yearlyRevenueResult && yearlyRevenueResult[0] && yearlyRevenueResult[0].total 
        ? parseFloat(yearlyRevenueResult[0].total) 
        : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
};
