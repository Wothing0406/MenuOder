const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Store = require('../models/Store');
const Item = require('../models/Item');
const { Sequelize } = require('sequelize');
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
        shippingFee = calculateShippingFee(deliveryDistance, 10000); // 12,000 VND per km

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

    // Add shipping fee to total for delivery orders
    const finalTotal = totalAmount + shippingFee;

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

    // Calculate today's revenue (delivered orders today only)
    const todayRevenueResult = await Order.findAll({
      attributes: [[Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'total']],
      where: { 
        storeId: store.id, 
        status: 'delivered',
        createdAt: {
          [Op.between]: [startOfToday, endOfToday]
        }
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
      todayRevenue: todayRevenueResult && todayRevenueResult[0] && todayRevenueResult[0].total 
        ? parseFloat(todayRevenueResult[0].total) 
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
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể xác thực địa chỉ',
      error: error.message
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
    const shippingFee = calculateShippingFee(distanceResult.distance, 10000);

    res.json({
      success: true,
      data: {
        distance: distanceResult.distance,
        duration: distanceResult.duration,
        shippingFee: shippingFee
      }
    });
  } catch (error) {
    console.error('Calculate shipping error:', error);
    res.status(400).json({
      success: false,
      message: `Không thể tính khoảng cách: ${error.message}`,
      error: error.message
    });
  }
};
