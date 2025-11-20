const Store = require('../models/Store');
const Category = require('../models/Category');
const Item = require('../models/Item');
const ItemOption = require('../models/ItemOption');

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

    const store = await Store.findOne({
      where: { userId: req.user.id }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    await store.update({
      storeName: storeName || store.storeName,
      storePhone: storePhone || store.storePhone,
      storeAddress: storeAddress || store.storeAddress,
      storeDescription: storeDescription || store.storeDescription
    });

    res.json({
      success: true,
      message: 'Store updated successfully',
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
