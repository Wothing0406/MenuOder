const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Store = require('../models/Store');
const Item = require('../models/Item');
const ItemOption = require('../models/ItemOption');
const Voucher = require('../models/Voucher');
const { sequelize, Sequelize } = require('../config/database');
const Op = Sequelize.Op;
// Use OpenStreetMap (FREE) instead of Google Maps
const { calculateDistance, calculateShippingFee, geocodeAddress } = require('../utils/openStreetMap');

// Helper function to calculate street name similarity
function calculateStreetSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const normalize = (s) => s.toLowerCase()
    .replace(/đường|street|road|đc/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  const n1 = normalize(str1);
  const n2 = normalize(str2);
  
  if (n1 === n2) return 1;
  if (n1.includes(n2) || n2.includes(n1)) return 0.8;
  
  const words1 = n1.split(/\s+/).filter(w => w.length > 2);
  const words2 = n2.split(/\s+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  let matches = 0;
  words1.forEach(word => {
    if (words2.some(w => w.includes(word) || word.includes(w))) {
      matches++;
    }
  });
  
  return matches / Math.max(words1.length, words2.length);
}

const normalizeVoucherCode = (code = '') => code.trim().toUpperCase();

const ensureVoucherAvailable = (voucher) => {
  if (!voucher.isActive) {
    throw new Error('Voucher đã bị vô hiệu hoá');
  }
  const now = new Date();
  if (voucher.startsAt && now < voucher.startsAt) {
    throw new Error('Voucher chưa đến thời gian sử dụng');
  }
  if (!voucher.neverExpires && voucher.expiresAt && now > voucher.expiresAt) {
    throw new Error('Voucher đã hết hạn');
  }
  if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
    throw new Error('Voucher đã đạt giới hạn sử dụng');
  }
};

const calculateVoucherDiscount = (voucher, orderAmount) => {
  let discount = 0;
  if (voucher.discountType === 'percentage') {
    discount = (orderAmount * Number(voucher.discountValue)) / 100;
  } else {
    discount = Number(voucher.discountValue);
  }

  if (voucher.maxDiscountAmount) {
    discount = Math.min(discount, Number(voucher.maxDiscountAmount));
  }

  if (discount > orderAmount) {
    discount = orderAmount;
  }

  return parseFloat(discount.toFixed(2));
};

// Generate order code
const generateOrderCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// Create order (public - no auth needed)
exports.createOrder = async (req, res) => {
  try {
    const { 
      storeId, 
      orderType = 'dine_in',
      tableNumber, 
      deliveryAddress,
      customerName, 
      customerPhone, 
      customerEmail, 
      customerNote, 
      items 
    } = req.body;

    console.log('Order creation request:', { 
      storeId, 
      orderType, 
      tableNumber, 
      deliveryAddress,
      customerName, 
      customerPhone, 
      itemsCount: items?.length 
    });

    // Validation
    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required'
      });
    }

    // Validate orderType
    if (!['dine_in', 'delivery'].includes(orderType)) {
      return res.status(400).json({
        success: false,
        message: 'Loại đơn hàng không hợp lệ. Chỉ chấp nhận: dine_in hoặc delivery'
      });
    }

    // Validate based on order type
    if (orderType === 'dine_in') {
      // Dine-in: chỉ cần số bàn
      if (!tableNumber || tableNumber === '') {
        return res.status(400).json({
          success: false,
          message: 'Số bàn là bắt buộc cho đơn hàng tại quán'
        });
      }
      const parsed = parseInt(String(tableNumber).trim());
      if (isNaN(parsed) || parsed < 1) {
        return res.status(400).json({
          success: false,
          message: 'Số bàn phải là số nguyên dương'
        });
      }
    } else if (orderType === 'delivery') {
      // Delivery: chỉ cần tên và số điện thoại (không cần email)
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

      if (!deliveryAddress || (typeof deliveryAddress === 'string' && deliveryAddress.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: 'Địa chỉ giao hàng là bắt buộc'
        });
      }
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất một món'
      });
    }

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Calculate distance and shipping fee for delivery orders
    let deliveryDistance = null;
    let shippingFee = 0;

    if (orderType === 'delivery') {
      try {
        if (!store.storeAddress) {
          return res.status(400).json({
            success: false,
            message: 'Cửa hàng chưa có địa chỉ. Vui lòng liên hệ cửa hàng.'
          });
        }

        const distanceResult = await calculateDistance(
          store.storeAddress,
          deliveryAddress
        );
        
        deliveryDistance = distanceResult.distance;

        // Enforce hard business rules for delivery distance
        if (deliveryDistance > 15) {
          return res.status(400).json({
            success: false,
            message: 'Ngoài phạm vi giao hàng'
          });
        }

        const shippingResult = calculateShippingFee(deliveryDistance, 10000); // business rules handled internally

        if (shippingResult.status === 'error') {
          return res.status(400).json({
            success: false,
            message: shippingResult.message || 'Không thể tính phí giao hàng'
          });
        }

        shippingFee = shippingResult.shippingFee;
        // Optionally surface message/status for client if needed later
        req.shippingInfo = {
          distance: deliveryDistance,
          status: shippingResult.status,
          message: shippingResult.message,
          shippingFee
        };

        console.log('Delivery calculation:', {
          origin: store.storeAddress,
          destination: deliveryAddress,
          distance: deliveryDistance,
          shippingFee
        });
      } catch (distanceError) {
        console.error('Error calculating distance:', distanceError);
        return res.status(400).json({
          success: false,
          message: `Không thể tính khoảng cách: ${distanceError.message}. Vui lòng kiểm tra lại địa chỉ giao hàng.`
        });
      }
    }

    // Validate tableNumber for dine-in
    let tableNum = null;
    if (orderType === 'dine_in') {
      const parsed = parseInt(String(tableNumber).trim());
      if (isNaN(parsed) || parsed < 1) {
        return res.status(400).json({
          success: false,
          message: 'Số bàn phải là số nguyên dương'
        });
      }
      tableNum = parsed;
    }

    // Calculate total and create order items
    let itemsSubtotal = 0;
    const orderItems = [];

    // Helper: chuẩn hoá optionValues từ DB
    const normalizeOptionValues = (values) => {
      if (!values) return [];
      let arr = [];
      if (Array.isArray(values)) {
        arr = values;
      } else if (typeof values === 'string') {
        const trimmed = values.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              arr = parsed;
            } else if (parsed && typeof parsed === 'object') {
              arr = Object.values(parsed);
            } else {
              arr = [values];
            }
          } catch {
            arr = [values];
          }
        } else {
          arr = [values];
        }
      } else if (typeof values === 'object') {
        arr = Object.values(values);
      } else if (typeof values === 'number') {
        arr = [values];
      }

      return arr.map(v => {
        if (typeof v === 'string' || typeof v === 'number') {
          return { name: String(v), price: 0 };
        }
        return {
          name: typeof v?.name === 'string' ? v.name : '',
          price: Number(v?.price) || 0
        };
      });
    };

    for (const cartItem of items) {
      const item = await Item.findByPk(cartItem.itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: `Item ${cartItem.itemId} not found`
        });
      }
      let price = parseFloat(item.itemPrice || 0);

      // Add size/option price based on selectedOptions (map { optionId: valueName })
      if (cartItem.selectedOptions && typeof cartItem.selectedOptions === 'object') {
        for (const [optionId, selectedValue] of Object.entries(cartItem.selectedOptions)) {
          const numericId = parseInt(optionId, 10);
          if (!numericId || !selectedValue) continue;
          try {
            const option = await ItemOption.findByPk(numericId);
            if (option && option.optionValues) {
              const values = normalizeOptionValues(option.optionValues);
              const match = values.find(v => v.name === selectedValue);
              if (match && match.price) {
                price += parseFloat(match.price);
              }
            }
          } catch (e) {
            // ignore per-option error, continue with others
            console.error('Error processing item option for order:', e.message);
          }
        }
      }

      // Add accompaniments price (support quantity for new data, default 1 for old data)
      if (cartItem.selectedAccompaniments && Array.isArray(cartItem.selectedAccompaniments)) {
        cartItem.selectedAccompaniments.forEach(acc => {
          if (acc && acc.price) {
            const unitPrice = parseFloat(acc.price);
            const qtyAcc = acc.quantity !== undefined ? parseInt(acc.quantity, 10) || 0 : 1;
            if (qtyAcc > 0) {
              price += unitPrice * qtyAcc;
            } else {
              price += unitPrice;
            }
          }
        });
      }
      
      const qty = parseInt(cartItem.quantity || 1, 10);
      const itemSubtotal = parseFloat((price * qty).toFixed(2));
      itemsSubtotal += itemSubtotal;

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

    // Add shipping fee to total for delivery orders
    // Apply voucher if provided
    const requestedVoucherCode = normalizeVoucherCode(req.body.voucherCode || '');
    let appliedVoucher = null;
    let discountAmount = 0;

    if (requestedVoucherCode) {
      let voucher = await Voucher.findOne({
        where: {
          storeId: store.id,
          code: requestedVoucherCode
        }
      });

      // Fallback: try global voucher (storeId is NULL)
      if (!voucher) {
        voucher = await Voucher.findOne({
          where: {
            storeId: null,
            code: requestedVoucherCode
          }
        });
      }

      if (!voucher) {
        // Ignore invalid voucher code: proceed without applying any discount
        voucher = null;
      }

      if (voucher) {
        try {
          ensureVoucherAvailable(voucher);
        } catch (voucherError) {
          // Ignore unavailable voucher and proceed without applying any discount
          voucher = null;
        }
      }

      if (voucher && itemsSubtotal < Number(voucher.minOrderAmount || 0)) {
        // Do not apply voucher if minimum order amount is not met
        voucher = null;
      }

      if (voucher) {
        discountAmount = calculateVoucherDiscount(voucher, itemsSubtotal);
        appliedVoucher = voucher;
      }
    }

    const subtotalAfterDiscount = Math.max(0, itemsSubtotal - discountAmount);
    const finalTotal = subtotalAfterDiscount + shippingFee;

    // Create order
    const orderData = {
      storeId: parseInt(storeId),
      orderType: orderType,
      tableNumber: tableNum,
      deliveryAddress: orderType === 'delivery' ? (typeof deliveryAddress === 'string' ? deliveryAddress.trim() : deliveryAddress) : null,
      deliveryDistance: deliveryDistance,
      shippingFee: parseFloat(shippingFee.toFixed(2)),
      orderCode: generateOrderCode(),
      // Set customerName and customerPhone based on order type
      // For delivery: required
      // For dine_in: optional (phone for tracking)
      customerName: orderType === 'delivery' ? (typeof customerName === 'string' ? customerName.trim() : customerName) : null,
      customerPhone: orderType === 'delivery' 
        ? (typeof customerPhone === 'string' ? customerPhone.trim() : customerPhone)
        : (customerPhone && typeof customerPhone === 'string' && customerPhone.trim() ? customerPhone.trim() : null),
      customerEmail: orderType === 'delivery' ? null : (customerEmail && typeof customerEmail === 'string' ? customerEmail.trim() : (customerEmail || null)),
      customerNote: customerNote && typeof customerNote === 'string' ? customerNote.trim() : (customerNote || null),
      paymentMethod: req.body.paymentMethod || 'cash',
      voucherId: appliedVoucher ? appliedVoucher.id : null,
      voucherCode: appliedVoucher ? appliedVoucher.code : null,
      discountType: appliedVoucher ? appliedVoucher.discountType : null,
      discountValue: appliedVoucher ? appliedVoucher.discountValue : null,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      totalAmount: parseFloat(finalTotal.toFixed(2))
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

    if (appliedVoucher) {
      try {
        await appliedVoucher.increment('usageCount');
      } catch (voucherCountError) {
        console.error('Voucher usage increment error:', voucherCountError);
      }
    }

    // Fetch complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        { association: 'items' },
        { association: 'voucher', required: false }
      ]
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

    const { status, page = 1, limit = 10, date } = req.query;
    const offset = (page - 1) * limit;

    let where = { storeId: store.id };
    if (status) {
      where.status = status;
    }
    
    // Filter by date if provided (format: YYYY-MM-DD)
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.createdAt = {
        [Op.between]: [startOfDay, endOfDay]
      };
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
      include: [
        { association: 'items' },
        { association: 'voucher', required: false },
        { 
          association: 'store',
          attributes: ['id', 'storeName', 'storeAddress', 'storePhone']
        },
        {
          association: 'paymentAccount',
          required: false,
          attributes: ['id', 'accountName', 'bankAccountNumber', 'bankAccountName', 'bankName', 'bankCode']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Giữ nguyên paymentMethod; nếu thiếu nhưng có paymentAccount -> suy ra chuyển khoản
    const orderData = order.toJSON();
    if (!orderData.paymentMethod && orderData.paymentAccountId) {
      orderData.paymentMethod = 'bank_transfer';
    }

    res.json({
      success: true,
      data: orderData
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

// Track order by orderCode or phone number (public)
exports.trackOrder = async (req, res) => {
  try {
    const { orderCode, phoneNumber } = req.query;

    if (!orderCode && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã đơn hàng hoặc số điện thoại'
      });
    }

    let where = {};
    
    if (orderCode) {
      where.orderCode = orderCode.trim().toUpperCase();
    }
    
    if (phoneNumber) {
      // Normalize phone number (remove spaces, dashes, etc.)
      const normalizedPhone = phoneNumber.trim().replace(/[\s\-\(\)]/g, '');
      where.customerPhone = {
        [Op.like]: `%${normalizedPhone}%`
      };
    }

    const orders = await Order.findAll({
      where,
      include: [
        { association: 'items' },
        { 
          association: 'store',
          attributes: ['id', 'storeName', 'storeAddress', 'storePhone']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10 // Limit to 10 most recent orders
    });

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn hàng hoặc số điện thoại.'
      });
    }

    res.json({
      success: true,
      data: orders.length === 1 ? orders[0] : orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tìm kiếm đơn hàng',
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

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Determine next status and payment flag
    const nextStatus = status || order.status;
    let nextIsPaid = isPaid !== undefined ? isPaid : order.isPaid;

    // Auto mark as paid when completed if not explicitly provided
    if (nextStatus === 'completed' && isPaid === undefined) {
      nextIsPaid = true;
    }

    // Khi chủ quán chuyển trạng thái sang "confirmed" => coi như đã nhận tiền
    // (áp dụng cho mọi phương thức, vì đây là hành động xác nhận của cửa hàng)
    if (nextStatus === 'confirmed' && isPaid === undefined) {
      nextIsPaid = true;
    }

    await order.update({
      status: nextStatus,
      isPaid: nextIsPaid
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
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endOfToday.setHours(23, 59, 59, 999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get total orders
    const totalOrders = await Order.count({ where: { storeId: store.id } });
    
    // Get pending orders
    const pendingOrders = await Order.count({
      where: { storeId: store.id, status: 'pending' }
    });
    
    // Get completed orders (delivered status)
    const completedOrders = await Order.count({
      where: { storeId: store.id, status: 'completed' }
    });

    // Detect database dialect for proper SQL syntax
    const dbDialect = sequelize.getDialect();
    const isPostgres = dbDialect === 'postgres';
    
    // PostgreSQL: Sequelize uses camelCase column names with quotes
    // MySQL: Uses backticks
    // For PostgreSQL, we need to use the exact column name as defined in model
    // Sequelize by default uses camelCase, so "paymentMethod" in PostgreSQL
    const quote = isPostgres ? '"' : '`';
    // In PostgreSQL, Sequelize creates columns with camelCase names (e.g., "paymentMethod")
    // We need to use the exact name from the model definition
    const paymentMethodCol = isPostgres ? '"paymentMethod"' : '`paymentMethod`';
    const totalAmountCol = isPostgres ? '"totalAmount"' : '`totalAmount`';
    
    // Calculate total revenue (all completed orders - paid) + breakdown theo phương thức
    // Use COALESCE to handle NULL results from SUM
    const totalRevenueResult = await Order.findAll({
      attributes: [
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('totalAmount')), 0), 'total'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal(`CASE 
          WHEN ${paymentMethodCol} = 'cash' THEN ${totalAmountCol} ELSE 0 END`)), 0), 'cashTotal'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal(`CASE 
          WHEN ${paymentMethodCol} = 'bank_transfer' OR ${paymentMethodCol} = 'bank_transfer_qr' THEN ${totalAmountCol} ELSE 0 END`)), 0), 'bankTotal'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal(`CASE 
          WHEN ${paymentMethodCol} = 'zalopay_qr' THEN ${totalAmountCol} ELSE 0 END`)), 0), 'zaloTotal'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal(`CASE 
          WHEN ${paymentMethodCol} NOT IN ('cash', 'bank_transfer', 'bank_transfer_qr', 'zalopay_qr') OR ${paymentMethodCol} IS NULL THEN ${totalAmountCol} ELSE 0 END`)), 0), 'otherTotal']
      ],
      where: { 
        storeId: store.id, 
        status: 'completed' 
      },
      raw: true
    });

    // Calculate today's revenue (completed orders today only)
    const todayRevenueResult = await Order.findAll({
      attributes: [[Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('totalAmount')), 0), 'total']],
      where: { 
        storeId: store.id, 
        status: 'completed',
        createdAt: {
          [Op.between]: [startOfToday, endOfToday]
        }
      },
      raw: true
    });

    // Calculate monthly revenue (completed orders this month)
    const monthlyRevenueResult = await Order.findAll({
      attributes: [[Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('totalAmount')), 0), 'total']],
      where: { 
        storeId: store.id, 
        status: 'completed',
        createdAt: {
          [Op.gte]: startOfMonth
        }
      },
      raw: true
    });

    // Calculate yearly revenue (completed orders this year)
    const yearlyRevenueResult = await Order.findAll({
      attributes: [[Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('totalAmount')), 0), 'total']],
      where: { 
        storeId: store.id, 
        status: 'completed',
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
      todayRevenue: todayRevenueResult && todayRevenueResult[0] && todayRevenueResult[0].total 
        ? parseFloat(todayRevenueResult[0].total) 
        : 0,
      monthlyRevenue: monthlyRevenueResult && monthlyRevenueResult[0] && monthlyRevenueResult[0].total 
        ? parseFloat(monthlyRevenueResult[0].total) 
        : 0,
      yearlyRevenue: yearlyRevenueResult && yearlyRevenueResult[0] && yearlyRevenueResult[0].total 
        ? parseFloat(yearlyRevenueResult[0].total) 
        : 0,
      breakdown: {
        cash: totalRevenueResult && totalRevenueResult[0] && totalRevenueResult[0].cashTotal
          ? parseFloat(totalRevenueResult[0].cashTotal) : 0,
        bank: totalRevenueResult && totalRevenueResult[0] && totalRevenueResult[0].bankTotal
          ? parseFloat(totalRevenueResult[0].bankTotal) : 0,
        zalopay: totalRevenueResult && totalRevenueResult[0] && totalRevenueResult[0].zaloTotal
          ? parseFloat(totalRevenueResult[0].zaloTotal) : 0,
        other: totalRevenueResult && totalRevenueResult[0] && totalRevenueResult[0].otherTotal
          ? parseFloat(totalRevenueResult[0].otherTotal) : 0,
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    console.error('Error stack:', error.stack);
    if (error.original) {
      console.error('Original database error:', error.original.message);
      console.error('Original error code:', error.original.code);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message,
      // Include more details in development
      ...(process.env.NODE_ENV === 'development' && {
        details: error.original?.message || error.message,
        stack: error.stack
      })
    });
  }
};

// Get revenue chart data (daily, weekly, monthly)
exports.getRevenueChartData = async (req, res) => {
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

    const { period = 'month' } = req.query; // 'week', 'month', 'year'
    const now = new Date();
    let startDate, endDate;

    if (period === 'week') {
      // Last 7 days
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      // Last 30 days
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'year') {
      // Last 12 months
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }

    // Normalize payment method to make sure new bank methods are grouped correctly
    const normalizePaymentMethod = (methodRaw, paymentAccountId) => {
      // Ưu tiên nhận diện có paymentAccountId (chỉ có ở chuyển khoản)
      if (paymentAccountId) return 'bank_transfer';

      if (!methodRaw) return 'cash';
      const method = String(methodRaw).toLowerCase();
      if (method === 'cash') return 'cash';
      if (method.includes('zalo')) return 'zalopay_qr';
      // Gom tất cả biến thể chuyển khoản: bank_transfer, bank_transfer_qr, vietqr, qr_bank...
      if (
        method.includes('bank') ||
        method.includes('transfer') ||
        method.includes('qr')
      ) {
        return 'bank_transfer';
      }
      return 'other';
    };

    // Get orders grouped by date & payment method to build breakdown by channel
    const orders = await Order.findAll({
      where: {
        storeId: store.id,
        createdAt: {
          [Op.between]: [startDate, endDate]
        },
        // Chỉ tính doanh thu đơn đã hoàn tất để tránh cộng nháp
        status: 'completed'
      },
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
        'paymentMethod',
        'paymentAccountId',
        [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'revenue'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'orderCount']
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'paymentMethod', 'paymentAccountId'],
      order: [
        [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']
      ],
      raw: true
    });

    // Aggregate revenue by payment method for each date
    const aggregatedByDate = {};
    orders.forEach(item => {
      const dateKey = item.date;
      if (!aggregatedByDate[dateKey]) {
        aggregatedByDate[dateKey] = {
          date: dateKey,
          revenue: 0,
          orderCount: 0,
          cashRevenue: 0,
          bankTransferRevenue: 0,
          zaloPayRevenue: 0,
          otherRevenue: 0
        };
      }

      const revenue = parseFloat(item.revenue || 0);
      const count = parseInt(item.orderCount || 0);
      aggregatedByDate[dateKey].revenue += revenue;
      aggregatedByDate[dateKey].orderCount += count;

      const method = normalizePaymentMethod(item.paymentMethod, item.paymentAccountId);
      if (method === 'cash') {
        aggregatedByDate[dateKey].cashRevenue += revenue;
      } else if (method === 'bank_transfer') {
        aggregatedByDate[dateKey].bankTransferRevenue += revenue;
      } else if (method === 'zalopay_qr') {
        aggregatedByDate[dateKey].zaloPayRevenue += revenue;
      } else {
        aggregatedByDate[dateKey].otherRevenue += revenue;
      }
    });

    const chartData = Object.values(aggregatedByDate)
      .map(item => ({
        ...item,
        nonCashRevenue: item.bankTransferRevenue + item.zaloPayRevenue + item.otherRevenue
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Get revenue chart data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue chart data',
      error: error.message
    });
  }
};

// Get top selling items
exports.getTopSellingItems = async (req, res) => {
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

    const { limit = 10, period = 'month' } = req.query;
    const now = new Date();
    let startDate;

    if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      startDate = null; // All time
    }

    // Detect database dialect
    const dbDialect = sequelize.getDialect();
    const isPostgres = dbDialect === 'postgres';

    // Build SQL query based on database type
    let sqlQuery;
    if (isPostgres) {
      // PostgreSQL query with quoted identifiers
      sqlQuery = `
        SELECT 
          oi."itemId",
          i."itemName",
          i."itemPrice",
          i."itemImage",
          SUM(oi.quantity)::integer as "totalQuantity",
          SUM(oi.quantity * oi."itemPrice")::decimal as "totalRevenue"
        FROM "order_items" oi
        INNER JOIN "orders" o ON oi."orderId" = o.id
        INNER JOIN "items" i ON oi."itemId" = i.id
        WHERE o."storeId" = :storeId 
          AND o.status = 'completed'
          ${startDate ? 'AND o."createdAt" >= :startDate' : ''}
        GROUP BY oi."itemId", i."itemName", i."itemPrice", i."itemImage"
        ORDER BY "totalQuantity" DESC
        LIMIT :limit
      `;
    } else {
      // MySQL query
      sqlQuery = `
        SELECT 
          oi.itemId,
          i.itemName,
          i.itemPrice,
          i.itemImage,
          SUM(oi.quantity) as totalQuantity,
          SUM(oi.quantity * oi.itemPrice) as totalRevenue
        FROM order_items oi
        INNER JOIN orders o ON oi.orderId = o.id
        INNER JOIN items i ON oi.itemId = i.id
        WHERE o.storeId = :storeId 
          AND o.status = 'completed'
          ${startDate ? 'AND o.createdAt >= :startDate' : ''}
        GROUP BY oi.itemId, i.itemName, i.itemPrice, i.itemImage
        ORDER BY totalQuantity DESC
        LIMIT :limit
      `;
    }

    const replacements = {
      storeId: store.id,
      limit: parseInt(limit)
    };

    if (startDate) {
      replacements.startDate = startDate;
    }

    const topItemsData = await sequelize.query(sqlQuery, {
      replacements,
      type: Sequelize.QueryTypes.SELECT
    });

    const formattedItems = topItemsData.map(item => ({
      itemId: item.itemId || item.itemid, // Handle case sensitivity
      itemName: item.itemName || item.itemname || 'Unknown',
      itemPrice: parseFloat(item.itemPrice || item.itemprice || 0),
      itemImage: item.itemImage || item.itemimage || null,
      totalQuantity: parseInt(item.totalQuantity || item.totalquantity || 0),
      totalRevenue: parseFloat(item.totalRevenue || item.totalrevenue || 0)
    }));

    res.json({
      success: true,
      data: formattedItems
    });
  } catch (error) {
    console.error('Get top selling items error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to get top selling items',
      error: error.message
    });
  }
};

// Get order type statistics (dine_in vs delivery)
exports.getOrderTypeStats = async (req, res) => {
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

    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;

    if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      startDate = null;
    }

    const whereCondition = {
      storeId: store.id,
      status: 'completed'
    };

    if (startDate) {
      whereCondition.createdAt = {
        [Op.gte]: startDate
      };
    }

    const stats = await Order.findAll({
      where: whereCondition,
      attributes: [
        'orderType',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'revenue']
      ],
      group: ['orderType'],
      raw: true
    });

    const formattedStats = {
      dine_in: { count: 0, revenue: 0 },
      delivery: { count: 0, revenue: 0 }
    };

    stats.forEach(stat => {
      const type = stat.orderType === 'dine_in' ? 'dine_in' : 'delivery';
      formattedStats[type] = {
        count: parseInt(stat.count || 0),
        revenue: parseFloat(stat.revenue || 0)
      };
    });

    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Get order type stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order type statistics',
      error: error.message
    });
  }
};

// Calculate shipping fee (public - for preview)
// Validate and geocode address (public)
exports.validateAddress = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || typeof address !== 'string' || !address.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Địa chỉ là bắt buộc'
      });
    }

    // Geocode the address
    const geocodeResult = await geocodeAddress(address.trim());

    // Check if address has house number
    const originalAddress = address.trim();
    
    // Check in original address (look for numbers at the start, e.g., "58", "123A", "45/12")
    const hasHouseNumberInOriginal = /^\d+[A-Za-z]?(\/\d+)?/.test(originalAddress) || 
                                     /^\d+/.test(originalAddress);
    
    // Check in validated address
    const validatedAddress = geocodeResult.formatted_address;
    const hasHouseNumberInValidated = /^\d+[A-Za-z]?(\/\d+)?/.test(validatedAddress) || 
                                      /^\d+/.test(validatedAddress);
    
    // Check if geocode result has house_number in address components
    const hasHouseNumberInComponents = geocodeResult.raw_result?.address?.house_number || 
                                       geocodeResult.raw_result?.address?.house;
    
    const hasHouseNumber = hasHouseNumberInOriginal || hasHouseNumberInValidated || !!hasHouseNumberInComponents;
    
    // Calculate similarity between original and validated address
    const similarity = geocodeResult.similarity || 0;
    
    // Check if street names are similar
    const originalStreetMatch = originalAddress.match(/(?:số\s*)?\d+[a-z]?\s*([^,]+)/i)?.[1]?.trim().toLowerCase();
    const validatedStreetMatch = validatedAddress.match(/(?:số\s*)?\d+[a-z]?\s*([^,]+)/i)?.[1]?.trim().toLowerCase() ||
                                 geocodeResult.raw_result?.address?.road?.toLowerCase();
    
    let warnings = [];
    
    if (!hasHouseNumber) {
      warnings.push('Địa chỉ này có vẻ không có số nhà/số đường. Vui lòng kiểm tra lại để đảm bảo địa chỉ chính xác.');
    }
    
    // Warn if similarity is too low (less than 40%)
    if (similarity < 0.4) {
      warnings.push('⚠️ CẢNH BÁO: Địa chỉ hệ thống tìm thấy khác khá nhiều so với địa chỉ bạn nhập. Vui lòng kiểm tra kỹ trước khi xác nhận!');
    }
    
    // Warn if street names don't match
    if (originalStreetMatch && validatedStreetMatch) {
      const streetSimilarity = calculateStreetSimilarity(originalStreetMatch, validatedStreetMatch);
      if (streetSimilarity < 0.5) {
        warnings.push(`⚠️ Tên đường khác nhau: Bạn nhập "${originalStreetMatch}" nhưng hệ thống tìm thấy "${validatedStreetMatch}". Vui lòng kiểm tra lại!`);
      }
    }

    res.json({
      success: true,
      data: {
        originalAddress: originalAddress,
        validatedAddress: validatedAddress,
        coordinates: {
          lat: geocodeResult.lat,
          lng: geocodeResult.lng
        },
        hasHouseNumber: hasHouseNumber,
        similarity: similarity,
        warning: warnings.length > 0 ? warnings.join(' ') : null
      }
    });
  } catch (error) {
    console.error('Validate address error:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more helpful error messages
    let errorMessage = 'Không thể xác thực địa chỉ';
    
    if (error.message) {
      if (error.message.includes('Không tìm thấy địa chỉ')) {
        errorMessage = error.message;
      } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        errorMessage = 'Không thể kết nối đến dịch vụ xác thực địa chỉ. Vui lòng thử lại sau.';
      } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        errorMessage = 'Yêu cầu xác thực địa chỉ quá thời gian. Vui lòng thử lại.';
      } else if (error.message.includes('rate limit') || error.message.includes('429')) {
        errorMessage = 'Quá nhiều yêu cầu. Vui lòng đợi một chút rồi thử lại.';
      } else {
        errorMessage = error.message;
      }
    }
    
    res.status(400).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.calculateShipping = async (req, res) => {
  try {
    const { origin, destination } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination addresses are required'
      });
    }

    const distanceResult = await calculateDistance(origin, destination);
    const distance = distanceResult.distance;

    // Enforce business limits explicitly
    if (distance > 15) {
      return res.status(400).json({
        success: false,
        distance,
        shippingFee: 0,
        status: 'error',
        message: 'Ngoài phạm vi giao hàng'
      });
    }

    const shippingResult = calculateShippingFee(distance, 10000);

    if (shippingResult.status === 'error') {
      return res.status(400).json({
        success: false,
        distance: shippingResult.distance,
        shippingFee: shippingResult.shippingFee,
        status: 'error',
        message: shippingResult.message
      });
    }

    res.json({
      success: true,
      distance: shippingResult.distance,
      shippingFee: shippingResult.shippingFee,
      status: 'ok',
      message: shippingResult.message || 'Tính phí giao hàng thành công',
      duration: distanceResult.duration
    });
  } catch (error) {
    console.error('Calculate shipping error:', error);
    res.status(400).json({
      success: false,
      distance: null,
      shippingFee: 0,
      status: 'error',
      message: `Không thể tính khoảng cách: ${error.message}`
    });
  }
};
