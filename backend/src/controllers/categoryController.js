const Category = require('../models/Category');
const Store = require('../models/Store');
const Item = require('../models/Item');

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { categoryName, categoryDescription } = req.body;

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const store = await Store.findOne({
      where: { userId: req.user.id }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Get current max displayOrder to assign new category at the end
    const maxOrderResult = await Category.findOne({
      where: { storeId: store.id },
      attributes: [[Category.sequelize.fn('MAX', Category.sequelize.col('displayOrder')), 'maxOrder']],
      raw: true
    });
    const maxOrder = maxOrderResult?.maxOrder ?? -1;
    const newDisplayOrder = maxOrder + 1;

    const category = await Category.create({
      storeId: store.id,
      categoryName,
      categoryDescription,
      displayOrder: newDisplayOrder
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// Get categories
exports.getCategories = async (req, res) => {
  try {
    const { storeId } = req.params;

    const categories = await Category.findAll({
      where: { storeId },
      order: [['displayOrder', 'ASC']]
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message
    });
  }
};

// Get my categories
exports.getMyCategories = async (req, res) => {
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

    const categories = await Category.findAll({
      where: { storeId: store.id },
      order: [['displayOrder', 'ASC']]
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get my categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { categoryName, categoryDescription, displayOrder } = req.body;

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

    if (category.storeId !== store.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await category.update({
      categoryName: categoryName || category.categoryName,
      categoryDescription: categoryDescription !== undefined ? categoryDescription : category.categoryDescription,
      displayOrder: displayOrder !== undefined ? displayOrder : category.displayOrder
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findByPk(categoryId, {
      include: [{
        model: Item,
        as: 'items'
      }]
    });

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

    // Delete category (items will be deleted automatically due to CASCADE)
    // But if items have orders and database hasn't been migrated, we need to handle that
    try {
      await category.destroy();
      
      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (destroyError) {
      // If deletion fails due to foreign key constraint, provide helpful message
      const errorMessage = destroyError.message || '';
      const errorName = destroyError.name || '';
      
      if (errorName === 'SequelizeForeignKeyConstraintError' || 
          errorMessage.includes('foreign key') ||
          errorMessage.includes('cannot delete') ||
          errorMessage.includes('violates foreign key constraint') ||
          errorMessage.includes('DELETE RESTRICT')) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa danh mục vì có món đã được đặt hàng. Vui lòng chạy migration database hoặc xóa các món trước.',
          error: 'Foreign key constraint violation',
          details: 'Category contains items that have been ordered. Please run database migration to allow deletion.'
        });
      }
      throw destroyError;
    }
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

// Reorder categories - batch update displayOrder
exports.reorderCategories = async (req, res) => {
  try {
    const { categoryOrders } = req.body; // Array of { categoryId, displayOrder }

    if (!Array.isArray(categoryOrders) || categoryOrders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'categoryOrders must be a non-empty array'
      });
    }

    const store = await Store.findOne({
      where: { userId: req.user.id }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Validate all categories belong to this store
    const categoryIds = categoryOrders.map(co => co.categoryId);
    const categories = await Category.findAll({
      where: {
        id: categoryIds,
        storeId: store.id
      }
    });

    if (categories.length !== categoryIds.length) {
      return res.status(403).json({
        success: false,
        message: 'Some categories not found or unauthorized'
      });
    }

    // Update all categories in a transaction
    const { sequelize } = require('../config/database');
    await sequelize.transaction(async (t) => {
      const updatePromises = categoryOrders.map(({ categoryId, displayOrder }) =>
        Category.update(
          { displayOrder },
          { where: { id: categoryId, storeId: store.id }, transaction: t }
        )
      );
      await Promise.all(updatePromises);
    });

    // Return updated categories
    const updatedCategories = await Category.findAll({
      where: { storeId: store.id },
      order: [['displayOrder', 'ASC']]
    });

    res.json({
      success: true,
      message: 'Categories reordered successfully',
      data: updatedCategories
    });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder categories',
      error: error.message
    });
  }
};
