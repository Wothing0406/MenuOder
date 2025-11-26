const Item = require('../models/Item');
const Category = require('../models/Category');
const Store = require('../models/Store');
const ItemOption = require('../models/ItemOption');

// Create item
exports.createItem = async (req, res) => {
  try {
    const { categoryId, itemName, itemDescription, itemPrice } = req.body;

    if (!categoryId || !itemName || !itemPrice) {
      return res.status(400).json({
        success: false,
        message: 'Category ID, item name, and price are required'
      });
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check ownership
    const store = await Store.findOne({
      where: { userId: req.user.id }
    });

    if (!store) {
      return res.status(403).json({
        success: false,
        message: 'Store not found. Please create a store first.'
      });
    }

    if (category.storeId !== store.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const item = await Item.create({
      categoryId,
      storeId: store.id,
      itemName,
      itemDescription,
      itemPrice: parseFloat(itemPrice)
    });

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create item',
      error: error.message
    });
  }
};

// Get items by category
exports.getItemsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const items = await Item.findAll({
      where: { categoryId, isAvailable: true },
      order: [['displayOrder', 'ASC']],
      include: {
        association: 'options',
        order: [['displayOrder', 'ASC']]
      }
    });

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get items',
      error: error.message
    });
  }
};

// Get item detail
exports.getItemDetail = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findByPk(itemId, {
      include: {
        association: 'options',
        order: [['displayOrder', 'ASC']]
      }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get item detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get item',
      error: error.message
    });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { itemName, itemDescription, itemPrice, isAvailable, displayOrder } = req.body;

    const item = await Item.findByPk(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check ownership
    const store = await Store.findOne({
      where: { userId: req.user.id }
    });

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

    await item.update({
      itemName: itemName || item.itemName,
      itemDescription: itemDescription !== undefined ? itemDescription : item.itemDescription,
      itemPrice: itemPrice !== undefined ? parseFloat(itemPrice) : item.itemPrice,
      isAvailable: isAvailable !== undefined ? isAvailable : item.isAvailable,
      displayOrder: displayOrder !== undefined ? displayOrder : item.displayOrder
    });

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item',
      error: error.message
    });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findByPk(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check ownership
    const store = await Store.findOne({
      where: { userId: req.user.id }
    });

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

    await item.destroy();

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: error.message
    });
  }
};
