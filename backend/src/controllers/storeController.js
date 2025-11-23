const Store = require('../models/Store');
const Category = require('../models/Category');
const Item = require('../models/Item');
const ItemOption = require('../models/ItemOption');
const path = require('path');
const fs = require('fs');

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
    const categories = await Category.findAll({
      where: { storeId: store.id },
      order: [['displayOrder', 'ASC']],
      include: {
        association: 'items',
        where: { isAvailable: true },
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

    res.json({
      success: true,
      data: {
        store,
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

    res.json({
      success: true,
      data: stores
    });
  } catch (error) {
    console.error('Get all stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stores',
      error: error.message
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

    res.json({
      success: true,
      data: store
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
    const { storeName, storePhone, storeAddress, storeDescription } = req.body;
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
        const oldLogoPath = path.join(__dirname, '../../', store.storeLogo);
        if (fs.existsSync(oldLogoPath)) {
          try {
            fs.unlinkSync(oldLogoPath);
          } catch (err) {
            console.error('Error deleting old logo:', err);
          }
        }
      }
      // Lưu đường dẫn logo mới
      logoPath = '/uploads/' + logoFile.filename;
    }

    await store.update({
      storeName: storeName || store.storeName,
      storePhone: storePhone || store.storePhone,
      storeAddress: storeAddress || store.storeAddress,
      storeDescription: storeDescription || store.storeDescription,
      storeLogo: logoPath || store.storeLogo
    });

    // Reload để lấy dữ liệu mới nhất
    await store.reload();

    res.json({
      success: true,
      message: logoFile ? 'Store and logo updated successfully' : 'Store updated successfully',
      data: store
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
      const filePath = path.join(__dirname, '../../', req.file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Xóa logo cũ nếu có
    if (store.storeLogo) {
      const oldLogoPath = path.join(__dirname, '../../', store.storeLogo);
      if (fs.existsSync(oldLogoPath)) {
        try {
          fs.unlinkSync(oldLogoPath);
        } catch (err) {
          console.error('Error deleting old logo:', err);
        }
      }
    }

    // Cập nhật logo mới
    const logoPath = '/uploads/' + req.file.filename;
    await store.update({ storeLogo: logoPath });
    await store.reload();

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: {
        storeLogo: store.storeLogo
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
