const ItemOption = require('../models/ItemOption');
const Item = require('../models/Item');
const Store = require('../models/Store');

// Create item option
exports.createItemOption = async (req, res) => {
  try {
    const { itemId, optionName, optionType, optionValues, isRequired } = req.body;

    if (!itemId || !optionName) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and option name are required'
      });
    }

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

    const itemOption = await ItemOption.create({
      itemId,
      optionName,
      optionType: optionType || 'select',
      optionValues: optionValues || [],
      isRequired: isRequired || false
    });

    res.status(201).json({
      success: true,
      message: 'Item option created successfully',
      data: itemOption
    });
  } catch (error) {
    console.error('Create item option error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create item option',
      error: error.message
    });
  }
};

// Get item options
exports.getItemOptions = async (req, res) => {
  try {
    const { itemId } = req.params;

    const options = await ItemOption.findAll({
      where: { itemId },
      order: [['displayOrder', 'ASC']]
    });

    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Get item options error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get item options',
      error: error.message
    });
  }
};

// Update item option
exports.updateItemOption = async (req, res) => {
  try {
    const { optionId } = req.params;
    const { optionName, optionType, optionValues, isRequired, displayOrder } = req.body;

    const option = await ItemOption.findByPk(optionId);

    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Item option not found'
      });
    }

    const item = await Item.findByPk(option.itemId);
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

    await option.update({
      optionName: optionName || option.optionName,
      optionType: optionType || option.optionType,
      optionValues: optionValues || option.optionValues,
      isRequired: isRequired !== undefined ? isRequired : option.isRequired,
      displayOrder: displayOrder !== undefined ? displayOrder : option.displayOrder
    });

    res.json({
      success: true,
      message: 'Item option updated successfully',
      data: option
    });
  } catch (error) {
    console.error('Update item option error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item option',
      error: error.message
    });
  }
};

// Delete item option
exports.deleteItemOption = async (req, res) => {
  try {
    const { optionId } = req.params;

    const option = await ItemOption.findByPk(optionId);

    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Item option not found'
      });
    }

    const item = await Item.findByPk(option.itemId);
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

    await option.destroy();

    res.json({
      success: true,
      message: 'Item option deleted successfully'
    });
  } catch (error) {
    console.error('Delete item option error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item option',
      error: error.message
    });
  }
};
