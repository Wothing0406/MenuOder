const ItemAccompaniment = require('../models/ItemAccompaniment');
const Item = require('../models/Item');
const Store = require('../models/Store');
const Category = require('../models/Category');

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

// Bulk create/update accompaniments for multiple items
exports.bulkCreateAccompaniments = async (req, res) => {
  try {
    const { accompanimentName, accompanimentPrice, isOptional = true, targetType = 'item', categoryId, itemIds } = req.body;

    if (!accompanimentName || accompanimentPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Accompaniment name and price are required'
      });
    }

    const store = await Store.findOne({ where: { userId: req.user.id } });
    if (!store) {
      return res.status(403).json({
        success: false,
        message: 'Store not found. Please create a store first.'
      });
    }

    // Determine target items
    let items = [];
    if (targetType === 'all') {
      items = await Item.findAll({ where: { storeId: store.id } });
    } else if (targetType === 'category') {
      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: 'categoryId is required when targetType is category'
        });
      }
      // Ensure category belongs to store
      const category = await Category.findOne({ where: { id: categoryId, storeId: store.id } });
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found in your store'
        });
      }
      items = await Item.findAll({ where: { storeId: store.id, categoryId } });
    } else if (targetType === 'list' && Array.isArray(itemIds) && itemIds.length > 0) {
      items = await Item.findAll({ where: { storeId: store.id, id: itemIds } });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid targetType. Use all, category, or list'
      });
    }

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No items found to apply accompaniment'
      });
    }

    const results = [];
    for (const item of items) {
      const existing = await ItemAccompaniment.findOne({
        where: {
          itemId: item.id,
          accompanimentName
        }
      });

      if (existing) {
        await existing.update({
          accompanimentPrice: parseFloat(accompanimentPrice || 0),
          isOptional: isOptional !== undefined ? isOptional : existing.isOptional
        });
        results.push({ itemId: item.id, status: 'updated', accompanimentId: existing.id });
      } else {
        const created = await ItemAccompaniment.create({
          itemId: item.id,
          accompanimentName,
          accompanimentPrice: parseFloat(accompanimentPrice || 0),
          isOptional: isOptional !== undefined ? isOptional : true
        });
        results.push({ itemId: item.id, status: 'created', accompanimentId: created.id });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Accompaniment applied successfully',
      data: {
        count: results.length,
        results
      }
    });
  } catch (error) {
    console.error('Bulk accompaniment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply accompaniment',
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
