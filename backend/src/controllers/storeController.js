const Store = require('../models/Store');
const Category = require('../models/Category');
const Item = require('../models/Item');
const ItemOption = require('../models/ItemOption');
const User = require('../models/User');
const Order = require('../models/Order');
const path = require('path');
const fs = require('fs');
const { Sequelize, Op } = require('../config/database');
const {
  deleteFromCloudinary,
  extractPublicIdFromUrl,
  isCloudinaryConfigured
} = require('../utils/cloudinary');
const { useCloudinary } = require('../middleware/upload');

// Get store by slug
exports.getStoreBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const store = await Store.findOne({
      where: { storeSlug: slug, isActive: true }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Get categories with items
    // Lưu ý: KHÔNG filter theo isAvailable để "hết món" vẫn hiển thị trong menu cho khách,
    // trạng thái hiển thị/disable order sẽ dựa trên remainingStock ở frontend.
    const categories = await Category.findAll({
      where: { storeId: store.id },
      order: [['displayOrder', 'ASC']],
      include: {
        association: 'items',
        order: [['displayOrder', 'ASC']],
        required: false,
        include: [
          {
            association: 'options',
            order: [['displayOrder', 'ASC']],
            required: false
          },
          {
            association: 'accompaniments',
            order: [['displayOrder', 'ASC']],
            required: false
          }
        ]
      }
    });

    // Helper function để tạo full URL cho logo
    const getLogoUrl = (logoPath) => {
      if (!logoPath) return null;
      // Nếu đã là full URL (Cloudinary hoặc external URL), trả về luôn
      if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
        return logoPath;
      }
      
      // Nếu là local path, tạo full URL
      if (process.env.NODE_ENV === 'production') {
        let backendUrl = process.env.BACKEND_URL;
        if (!backendUrl) {
          const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
          backendUrl = `${protocol}://${req.get('host')}`;
        }
        backendUrl = backendUrl.replace(/\/$/, '');
        const cleanPath = logoPath.startsWith('/') ? logoPath : '/' + logoPath;
        return backendUrl + cleanPath;
      }
      return logoPath;
    };

    const storeData = store.toJSON();
    if (storeData.storeLogo) {
      storeData.storeLogo = getLogoUrl(storeData.storeLogo);
    }
    if (storeData.storeImage) {
      storeData.storeImage = getLogoUrl(storeData.storeImage);
    }

    // Expose ZaloPay config flags (no secrets)
    storeData.zaloPayConfig = {
      isActive: storeData.zaloPayIsActive || false,
      appId: storeData.zaloPayAppId || null,
      merchantId: storeData.zaloPayMerchantId || null,
      hasKey1: !!storeData.zaloPayKey1,
      hasKey2: !!storeData.zaloPayKey2,
      link: storeData.zaloPayLink || null
    };

    res.json({
      success: true,
      data: {
        store: storeData,
        categories
      }
    });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get store',
      error: error.message
    });
  }
};

// Get all stores (public - for admin purposes)
exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.findAll({
      where: { isActive: true },
      attributes: { exclude: [] }
    });

    // Convert Sequelize instances to plain objects
    const storesData = stores.map(store => store.toJSON());

    res.json({
      success: true,
      data: storesData
    });
  } catch (error) {
    console.error('Get all stores error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to get stores',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get my store (authenticated user)
exports.getMyStore = async (req, res) => {
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

    // Tạo full URL cho logo nếu có
    const getLogoUrl = (path) => {
      if (!path) return null;
      // Nếu đã là full URL (Cloudinary hoặc external URL), trả về luôn
      if (path.startsWith('http://') || path.startsWith('https://')) return path;
      
      // Nếu là local path, tạo full URL
      if (process.env.NODE_ENV === 'production') {
        let backendUrl = process.env.BACKEND_URL;
        if (!backendUrl) {
          const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
          backendUrl = `${protocol}://${req.get('host')}`;
        }
        backendUrl = backendUrl.replace(/\/$/, '');
        const cleanPath = path.startsWith('/') ? path : '/' + path;
        return backendUrl + cleanPath;
      }
      return path;
    };

    const storeData = store.toJSON();
    if (storeData.storeLogo) {
      storeData.storeLogo = getLogoUrl(storeData.storeLogo);
    }
    if (storeData.storeImage) {
      storeData.storeImage = getLogoUrl(storeData.storeImage);
    }

    // ZaloPay config (expose non-sensitive flags only)
    storeData.zaloPayConfig = {
      isActive: storeData.zaloPayIsActive || false,
      appId: storeData.zaloPayAppId || null,
      merchantId: storeData.zaloPayMerchantId || null,
      hasKey1: !!storeData.zaloPayKey1,
      hasKey2: !!storeData.zaloPayKey2,
      link: storeData.zaloPayLink || null
    };

    // Bank Transfer QR config - moved to payment_accounts table
    // This is kept for backward compatibility but will be empty
    storeData.bankTransferConfig = {
      isActive: false,
      accountNumber: null,
      accountName: null,
      bankName: null,
      bankCode: null
    };

    res.json({
      success: true,
      data: storeData
    });
  } catch (error) {
    console.error('Get my store error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get store',
      error: error.message
    });
  }
};

// Update store
exports.updateStore = async (req, res) => {
  try {
    const { storeName, storePhone, storeAddress, storeDetailedAddress, storeDescription, zaloPayAppId, zaloPayKey1, zaloPayKey2, zaloPayMerchantId, zaloPayIsActive, zaloPayLink } = req.body;
    const logoFile = req.file; // File từ multer

    const store = await Store.findOne({
      where: { userId: req.user.id }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Nếu có logo mới, xóa logo cũ
    let logoPath = store.storeLogo;
    if (logoFile) {
      // Xóa logo cũ nếu có
      if (store.storeLogo) {
        if (useCloudinary && store.storeLogo.includes('cloudinary.com')) {
          // Xóa từ Cloudinary
          const publicId = extractPublicIdFromUrl(store.storeLogo);
          if (publicId) {
            await deleteFromCloudinary(publicId);
          }
        } else {
          // Xóa file local
          const oldLogoPath = path.join(__dirname, '../../', store.storeLogo);
          if (fs.existsSync(oldLogoPath)) {
            try {
              fs.unlinkSync(oldLogoPath);
            } catch (err) {
              console.error('Error deleting old logo:', err);
            }
          }
        }
      }
      // Lưu đường dẫn logo mới
      // Nếu dùng Cloudinary, logoFile.path sẽ là Cloudinary URL
      // Nếu không, sẽ là đường dẫn local
      logoPath = logoFile.cloudinary ? logoFile.cloudinary.url : ('/uploads/' + logoFile.filename);
    }

    // Cập nhật thông tin store
    const updateData = {
      storeName: storeName || store.storeName,
      storePhone: storePhone || store.storePhone,
      storeAddress: storeAddress || store.storeAddress,
      storeDetailedAddress: storeDetailedAddress !== undefined ? storeDetailedAddress : store.storeDetailedAddress,
      storeDescription: storeDescription || store.storeDescription
    };
    // ZaloPay config updates (optional)
    if (zaloPayAppId !== undefined) updateData.zaloPayAppId = zaloPayAppId || null;
    if (zaloPayKey1 !== undefined) updateData.zaloPayKey1 = zaloPayKey1 || null;
    if (zaloPayKey2 !== undefined) updateData.zaloPayKey2 = zaloPayKey2 || null;
    if (zaloPayMerchantId !== undefined) updateData.zaloPayMerchantId = zaloPayMerchantId || null;
    if (zaloPayIsActive !== undefined) updateData.zaloPayIsActive = !!zaloPayIsActive;
    if (zaloPayLink !== undefined) updateData.zaloPayLink = zaloPayLink || null;
    
    // Note: Bank Transfer QR config has been moved to payment_accounts table
    // Use /api/payment-accounts endpoints to manage bank transfer accounts
    
    // Nếu có logo mới, cập nhật
    if (logoPath) {
      updateData.storeLogo = logoPath;
    }
    
    // Xử lý storeImage nếu có trong body
    if (req.body.storeImage !== undefined) {
      // Nếu là empty string, xóa ảnh cũ
      if (req.body.storeImage === '') {
        if (store.storeImage) {
          if (useCloudinary && store.storeImage.includes('cloudinary.com')) {
            // Xóa từ Cloudinary
            const publicId = extractPublicIdFromUrl(store.storeImage);
            if (publicId) {
              await deleteFromCloudinary(publicId);
            }
          } else {
            // Xóa file local
            const oldImagePath = path.join(__dirname, '../../', store.storeImage);
            if (fs.existsSync(oldImagePath)) {
              try {
                fs.unlinkSync(oldImagePath);
              } catch (err) {
                console.error('Error deleting old store image:', err);
              }
            }
          }
        }
        updateData.storeImage = null;
      } else if (req.body.storeImage) {
        updateData.storeImage = req.body.storeImage;
      }
    }
    
    await store.update(updateData);
    await store.reload();

    // Tạo full URL cho logo
    const getLogoUrl = (logoPath) => {
      if (!logoPath) return null;
      if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
        return logoPath;
      }
      if (process.env.NODE_ENV === 'production') {
        let backendUrl = process.env.BACKEND_URL;
        if (!backendUrl) {
          const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
          backendUrl = `${protocol}://${req.get('host')}`;
        }
        backendUrl = backendUrl.replace(/\/$/, '');
        const cleanPath = logoPath.startsWith('/') ? logoPath : '/' + logoPath;
        return backendUrl + cleanPath;
      }
      return logoPath;
    };

    const storeData = store.toJSON();
    if (storeData.storeLogo) {
      storeData.storeLogo = getLogoUrl(storeData.storeLogo);
    }
    if (storeData.storeImage) {
      storeData.storeImage = getLogoUrl(storeData.storeImage);
    }

    res.json({
      success: true,
      message: logoFile ? 'Store and logo updated successfully' : 'Store updated successfully',
      data: storeData
    });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update store',
      error: error.message
    });
  }
};

// Upload store image (banner)
exports.uploadStoreImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const store = await Store.findOne({
      where: { userId: req.user.id }
    });

    if (!store) {
      // Xóa file vừa upload nếu store không tồn tại
      const filePath = path.join(__dirname, '../../', req.file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Xóa ảnh cũ nếu có
    if (store.storeImage) {
      if (useCloudinary && store.storeImage.includes('cloudinary.com')) {
        // Xóa từ Cloudinary
        const publicId = extractPublicIdFromUrl(store.storeImage);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } else {
        // Xóa file local
        const oldImagePath = path.join(__dirname, '../../', store.storeImage);
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (err) {
            console.error('Error deleting old store image:', err);
          }
        }
      }
    }

    // Cập nhật ảnh mới
    // Nếu dùng Cloudinary, req.file.path sẽ là Cloudinary URL
    // Nếu không, sẽ là đường dẫn local
    const imagePath = req.file.cloudinary ? req.file.cloudinary.url : ('/uploads/' + req.file.filename);
    
    await store.update({ storeImage: imagePath });
    await store.reload();

    // Tạo full URL cho ảnh
    const getImageUrl = (path) => {
      if (!path) return null;
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      
      if (process.env.NODE_ENV === 'production') {
        let backendUrl = process.env.BACKEND_URL;
        if (!backendUrl) {
          const protocol = 'https';
          const host = req.get('host');
          backendUrl = `${protocol}://${host}`;
        }
        backendUrl = backendUrl.replace(/\/$/, '');
        const cleanPath = path.startsWith('/') ? path : '/' + path;
        return backendUrl + cleanPath;
      }
      return path;
    };

    const imageUrl = getImageUrl(store.storeImage);

    res.json({
      success: true,
      message: 'Store image uploaded successfully',
      data: {
        storeImage: imageUrl,
        storeImagePath: store.storeImage
      }
    });
  } catch (error) {
    console.error('Upload store image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload store image',
      error: error.message
    });
  }
};

// Admin: get all stores with owner info
exports.adminGetStores = async (req, res) => {
  try {
    const stores = await Store.findAll({
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'email', 'storeName', 'role'],
          required: false // LEFT JOIN để lấy cả stores không có owner
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Convert Sequelize instances to plain objects
    const storesData = stores.map(store => {
      const storeData = store.toJSON();
      return storeData;
    });

    res.json({
      success: true,
      data: storesData
    });
  } catch (error) {
    console.error('Admin get stores error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách cửa hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update store open/closed status (for store owner)
exports.updateStoreStatus = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { is_open } = req.body;

    // Ensure the authenticated user owns this store
    const store = await Store.findOne({
      where: { id: storeId, userId: req.user.id }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found or you do not have permission to update this store'
      });
    }

    await store.update({ is_open: Boolean(is_open) });

    res.json({
      success: true,
      message: `Store status updated to ${is_open ? 'open' : 'closed'}`,
      data: store
    });
  } catch (error) {
    console.error('Update store status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update store status',
      error: error.message
    });
  }
};

// Admin: update store status
exports.adminUpdateStoreStatus = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { isActive } = req.body;

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Cửa hàng không tồn tại'
      });
    }

    await store.update({ isActive: Boolean(isActive) });

    res.json({
      success: true,
      message: 'Cập nhật trạng thái cửa hàng thành công',
      data: store
    });
  } catch (error) {
    console.error('Admin update store status error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái cửa hàng',
      error: error.message
    });
  }
};

// Upload logo only
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const store = await Store.findOne({
      where: { userId: req.user.id }
    });

    if (!store) {
      // Xóa file vừa upload nếu store không tồn tại
      if (useCloudinary && req.file.cloudinary) {
        // Xóa từ Cloudinary
        await deleteFromCloudinary(req.file.cloudinary.publicId);
      } else {
        // Xóa file local
        const filePath = path.join(__dirname, '../../', req.file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Xóa logo cũ nếu có
    if (store.storeLogo) {
      if (useCloudinary && store.storeLogo.includes('cloudinary.com')) {
        // Xóa từ Cloudinary
        const publicId = extractPublicIdFromUrl(store.storeLogo);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } else {
        // Xóa file local
        const oldLogoPath = path.join(__dirname, '../../', store.storeLogo);
        if (fs.existsSync(oldLogoPath)) {
          try {
            fs.unlinkSync(oldLogoPath);
          } catch (err) {
            console.error('Error deleting old logo:', err);
          }
        }
      }
    }

    // Cập nhật logo mới
    // Nếu dùng Cloudinary, req.file.path sẽ là Cloudinary URL
    // Nếu không, sẽ là đường dẫn local
    const logoPath = req.file.cloudinary ? req.file.cloudinary.url : ('/uploads/' + req.file.filename);
    
    await store.update({ storeLogo: logoPath });
    await store.reload();

    // Tạo full URL cho logo (bao gồm backend URL)
    // Trên Render, luôn dùng https
    const getLogoUrl = (path) => {
      if (!path) return null;
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path; // Đã là full URL
      }
      
      // Trong production (Render), tạo full URL với https
      if (process.env.NODE_ENV === 'production') {
        let backendUrl = process.env.BACKEND_URL;
        
        // Nếu không có BACKEND_URL, lấy từ request
        if (!backendUrl) {
          // Render luôn dùng https
          const protocol = 'https';
          const host = req.get('host');
          backendUrl = `${protocol}://${host}`;
          console.log('Generated backend URL from request:', backendUrl); // Debug
        }
        
        // Đảm bảo backendUrl không có trailing slash
        backendUrl = backendUrl.replace(/\/$/, '');
        
        // Đảm bảo path bắt đầu bằng /
        const cleanPath = path.startsWith('/') ? path : '/' + path;
        
        const fullUrl = backendUrl + cleanPath;
        console.log('Generated logo URL:', fullUrl); // Debug
        return fullUrl;
      }
      
      // Development: giữ relative path
      return path;
    };

    const logoUrl = getLogoUrl(store.storeLogo);

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: {
        storeLogo: logoUrl, // Full URL với https://
        storeLogoPath: store.storeLogo // Giữ path gốc trong DB
      }
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
      error: error.message
    });
  }
};

// Get orders for a specific store by date (for store owner)
exports.getStoreOrdersByDate = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { date, today } = req.query;

    // Verify that the authenticated user owns this store
    const store = await Store.findOne({
      where: { id: storeId, userId: req.user.id }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found or you do not have permission to access this store'
      });
    }

    let targetDate;

    // Determine target date
    if (date) {
      // Parse the provided date (expected format: YYYY-MM-DD)
      targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD format'
        });
      }
    } else if (today === 'true') {
      // Use today's date
      targetDate = new Date();
    } else {
      // Default to today if no date specified
      targetDate = new Date();
    }

    // Calculate date range (from start of day to end of day)
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Build where condition
    const whereCondition = {
      storeId: storeId,
      createdAt: {
        [Op.gte]: startOfDay,
        [Op.lte]: endOfDay
      }
    };

    const orders = await Order.findAll({
      where: whereCondition,
      order: [['createdAt', 'ASC']], // Sớm nhất trước
      include: [
        {
          association: 'orderItems',
          include: [
            {
              association: 'item',
              attributes: ['id', 'itemName', 'itemPrice']
            }
          ]
        }
      ]
    });

    // Format orders for response
    const formattedOrders = orders.map(order => {
      const orderData = order.toJSON();
      return {
        id: orderData.id,
        orderCode: orderData.orderCode,
        totalAmount: orderData.totalAmount,
        status: orderData.status,
        orderTime: orderData.createdAt, // HH:mm format will be handled by frontend
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        orderType: orderData.orderType,
        tableNumber: orderData.tableNumber,
        deliveryAddress: orderData.deliveryAddress
      };
    });

    res.json({
      success: true,
      data: {
        storeId: storeId,
        storeName: store.storeName,
        selectedDate: targetDate.toISOString().split('T')[0],
        isToday: targetDate.toDateString() === new Date().toDateString(),
        orders: formattedOrders,
        totalOrders: formattedOrders.length
      }
    });
  } catch (error) {
    console.error('Get store orders today error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get store orders',
      error: error.message
    });
  }
};
