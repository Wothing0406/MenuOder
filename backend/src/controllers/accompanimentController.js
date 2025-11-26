const ItemAccompaniment = require('../models/ItemAccompaniment');
const Item = require('../models/Item');
const Store = require('../models/Store');

// Create accompaniment
exports.createAccompaniment = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { accompanimentName, accompanimentPrice, isOptional } = req.body;

    // Validate input
    if (!accompanimentName || accompanimentPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Accompaniment name and price are required'
      });
    }

    // Check if item exists and belongs to user's store
    const item = await Item.findByPk(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const store = await Store.findOne({ where: { userId: req.user.id } });
    if (!store) {
      return res.status(403).json({
        success: false,
        message: 'Store not found. Please create a store first.'
      });
    }
    if (item.storeId !== store.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const accompaniment = await ItemAccompaniment.create({
      itemId,
      accompanimentName,
      accompanimentPrice: parseFloat(accompanimentPrice || 0),
      isOptional: isOptional !== undefined ? isOptional : true
    });

    res.status(201).json({
      success: true,
      message: 'Accompaniment created successfully',
      data: accompaniment
    });
  } catch (error) {
    console.error('Create accompaniment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create accompaniment',
      error: error.message
    });
  }
};

// Get accompaniments for an item
exports.getAccompaniments = async (req, res) => {
  try {
    const { itemId } = req.params;

    const accompaniments = await ItemAccompaniment.findAll({
      where: { itemId },
      order: [['displayOrder', 'ASC']]
    });

    res.json({
      success: true,
      data: accompaniments
    });
  } catch (error) {
    console.error('Get accompaniments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get accompaniments',
      error: error.message
    });
  }
};

// Update accompaniment
exports.updateAccompaniment = async (req, res) => {
  try {
    const { accompanimentId } = req.params;
    const { accompanimentName, accompanimentPrice, isOptional } = req.body;

    const accompaniment = await ItemAccompaniment.findByPk(accompanimentId);
    if (!accompaniment) {
      return res.status(404).json({
        success: false,
        message: 'Accompaniment not found'
      });
    }

    // Verify ownership
    const item = await Item.findByPk(accompaniment.itemId);
    const store = await Store.findOne({ where: { userId: req.user.id } });
    if (!store) {
      return res.status(403).json({
        success: false,
        message: 'Store not found. Please create a store first.'
      });
    }
    if (item.storeId !== store.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await accompaniment.update({
      accompanimentName: accompanimentName || accompaniment.accompanimentName,
      accompanimentPrice: accompanimentPrice !== undefined ? parseFloat(accompanimentPrice) : accompaniment.accompanimentPrice,
      isOptional: isOptional !== undefined ? isOptional : accompaniment.isOptional
    });

    res.json({
      success: true,
      message: 'Accompaniment updated successfully',
      data: accompaniment
    });
  } catch (error) {
    console.error('Update accompaniment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update accompaniment',
      error: error.message
    });
  }
};

// Delete accompaniment
exports.deleteAccompaniment = async (req, res) => {
  try {
    const { accompanimentId } = req.params;

    const accompaniment = await ItemAccompaniment.findByPk(accompanimentId);
    if (!accompaniment) {
      return res.status(404).json({
        success: false,
        message: 'Accompaniment not found'
      });
    }

    // Verify ownership
    const item = await Item.findByPk(accompaniment.itemId);
    const store = await Store.findOne({ where: { userId: req.user.id } });
    if (!store) {
      return res.status(403).json({
        success: false,
        message: 'Store not found. Please create a store first.'
      });
    }
    if (item.storeId !== store.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await accompaniment.destroy();

    res.json({
      success: true,
      message: 'Accompaniment deleted successfully'
    });
  } catch (error) {
    console.error('Delete accompaniment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete accompaniment',
      error: error.message
    });
  }
};
