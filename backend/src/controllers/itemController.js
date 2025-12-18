const Item = require('../models/Item');
const Category = require('../models/Category');
const Store = require('../models/Store');
const ItemOption = require('../models/ItemOption');
const path = require('path');
const fs = require('fs');
const { 
  deleteFromCloudinary, 
  extractPublicIdFromUrl,
  isCloudinaryConfigured 
} = require('../utils/cloudinary');
const { useCloudinary } = require('../middleware/upload');

// Create item
exports.createItem = async (req, res) => {
  try {
    const { categoryId, itemName, itemDescription, itemPrice, remainingStock } = req.body;

    if (!categoryId || !itemName || !itemPrice) {
      return res.status(400).json({
        success: false,
        message: 'Category ID, item name, and price are required'
      });
    }

    // Parse categoryId to integer (FormData sends strings)
    const parsedCategoryId = parseInt(categoryId, 10);
    if (isNaN(parsedCategoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const category = await Category.findByPk(parsedCategoryId);
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

    // Xử lý ảnh nếu có
    let itemImage = null;
    if (req.file) {
      // Nếu dùng Cloudinary, req.file.path sẽ là Cloudinary URL
      // Nếu không, sẽ là đường dẫn local
      itemImage = req.file.cloudinary ? req.file.cloudinary.url : ('/uploads/' + req.file.filename);
    }

    // Chuẩn hoá remainingStock:
    // - undefined hoặc '' => null ()
    // - số < 0 => 0
    // - số nguyên >= 0
    let normalizedStock = null;
    if (remainingStock !== undefined && remainingStock !== null && remainingStock !== '') {
      const parsedStock = parseInt(remainingStock, 10);
      if (!isNaN(parsedStock)) {
        normalizedStock = Math.max(0, parsedStock);
      }
    }

    const item = await Item.create({
      categoryId: parsedCategoryId,
      storeId: store.id,
      itemName,
      itemDescription,
      itemPrice: parseFloat(itemPrice),
      itemImage,
      remainingStock: normalizedStock
    });

    // Tạo full URL cho ảnh nếu cần
    const getImageUrl = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      if (process.env.NODE_ENV === 'production') {
        let backendUrl = process.env.BACKEND_URL;
        if (!backendUrl) {
          const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
          backendUrl = `${protocol}://${req.get('host')}`;
        }
        backendUrl = backendUrl.replace(/\/$/, '');
        const cleanPath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
        return backendUrl + cleanPath;
      }
      return imagePath;
    };

    const itemData = item.toJSON();
    if (itemData.itemImage) {
      itemData.itemImage = getImageUrl(itemData.itemImage);
    }

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: itemData
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
      // KHÔNG filter theo isAvailable để món "hết" vẫn hiển thị
      where: { categoryId },
      order: [['displayOrder', 'ASC']],
      include: [
        {
          association: 'options',
          order: [['displayOrder', 'ASC']]
        },
        {
          association: 'accompaniments',
          order: [['displayOrder', 'ASC']]
        }
      ]
    });

    // Helper function để tạo full URL cho ảnh
    const getImageUrl = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      if (process.env.NODE_ENV === 'production') {
        let backendUrl = process.env.BACKEND_URL;
        if (!backendUrl) {
          const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
          backendUrl = `${protocol}://${req.get('host')}`;
        }
        backendUrl = backendUrl.replace(/\/$/, '');
        const cleanPath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
        return backendUrl + cleanPath;
      }
      return imagePath;
    };

    // Cập nhật URL ảnh cho tất cả items
    const itemsData = items.map(item => {
      const itemData = item.toJSON();
      if (itemData.itemImage) {
        itemData.itemImage = getImageUrl(itemData.itemImage);
      }
      return itemData;
    });

    res.json({
      success: true,
      data: itemsData
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
      include: [
        {
          association: 'options',
          order: [['displayOrder', 'ASC']]
        },
        {
          association: 'accompaniments',
          order: [['displayOrder', 'ASC']]
        }
      ]
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Helper function để tạo full URL cho ảnh
    const getImageUrl = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      if (process.env.NODE_ENV === 'production') {
        let backendUrl = process.env.BACKEND_URL;
        if (!backendUrl) {
          const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
          backendUrl = `${protocol}://${req.get('host')}`;
        }
        backendUrl = backendUrl.replace(/\/$/, '');
        const cleanPath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
        return backendUrl + cleanPath;
      }
      return imagePath;
    };

    const itemData = item.toJSON();
    if (itemData.itemImage) {
      itemData.itemImage = getImageUrl(itemData.itemImage);
    }

    res.json({
      success: true,
      data: itemData
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
    const { itemName, itemDescription, itemPrice, isAvailable, displayOrder, remainingStock } = req.body;
    const imageFile = req.file; // File từ multer

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

    // Xử lý ảnh nếu có file mới
    let imagePath = item.itemImage;
    if (imageFile) {
      // Xóa ảnh cũ nếu có
      if (item.itemImage) {
        if (useCloudinary && item.itemImage.includes('cloudinary.com')) {
          // Xóa từ Cloudinary
          const publicId = extractPublicIdFromUrl(item.itemImage);
          if (publicId) {
            await deleteFromCloudinary(publicId);
          }
        } else {
          // Xóa file local
          const oldImagePath = path.join(__dirname, '../../', item.itemImage);
          if (fs.existsSync(oldImagePath)) {
            try {
              fs.unlinkSync(oldImagePath);
            } catch (err) {
              console.error('Error deleting old item image:', err);
            }
          }
        }
      }
      // Lưu đường dẫn ảnh mới
      imagePath = imageFile.cloudinary ? imageFile.cloudinary.url : ('/uploads/' + imageFile.filename);
    }

    // Xử lý xóa ảnh nếu itemImage được gửi là empty string
    if (req.body.itemImage !== undefined) {
      if (req.body.itemImage === '') {
        // Xóa ảnh
        if (item.itemImage) {
          if (useCloudinary && item.itemImage.includes('cloudinary.com')) {
            const publicId = extractPublicIdFromUrl(item.itemImage);
            if (publicId) {
              await deleteFromCloudinary(publicId);
            }
          } else {
            const oldImagePath = path.join(__dirname, '../../', item.itemImage);
            if (fs.existsSync(oldImagePath)) {
              try {
                fs.unlinkSync(oldImagePath);
              } catch (err) {
                console.error('Error deleting item image:', err);
              }
            }
          }
        }
        imagePath = null;
      } else if (req.body.itemImage) {
        // Giữ ảnh hiện tại hoặc dùng ảnh từ body
        imagePath = req.body.itemImage;
      }
    }

    // Chuẩn hoá remainingStock nếu được gửi lên
    let normalizedStock = item.remainingStock;
    if (remainingStock !== undefined) {
      if (remainingStock === '' || remainingStock === null) {
        normalizedStock = null;
      } else {
        const parsedStock = parseInt(remainingStock, 10);
        if (!isNaN(parsedStock)) {
          normalizedStock = Math.max(0, parsedStock);
        }
      }
    }

    await item.update({
      itemName: itemName !== undefined ? itemName : item.itemName,
      itemDescription: itemDescription !== undefined ? itemDescription : item.itemDescription,
      itemPrice: itemPrice !== undefined ? parseFloat(itemPrice) : item.itemPrice,
      isAvailable: isAvailable !== undefined ? isAvailable : item.isAvailable,
      displayOrder: displayOrder !== undefined ? displayOrder : item.displayOrder,
      itemImage: imagePath,
      remainingStock: normalizedStock
    });

    await item.reload();

    // Tạo full URL cho ảnh
    const getImageUrl = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      if (process.env.NODE_ENV === 'production') {
        let backendUrl = process.env.BACKEND_URL;
        if (!backendUrl) {
          const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
          backendUrl = `${protocol}://${req.get('host')}`;
        }
        backendUrl = backendUrl.replace(/\/$/, '');
        const cleanPath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
        return backendUrl + cleanPath;
      }
      return imagePath;
    };

    const itemData = item.toJSON();
    if (itemData.itemImage) {
      itemData.itemImage = getImageUrl(itemData.itemImage);
    }

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: itemData
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

    // Xóa ảnh trước khi xóa item
    if (item.itemImage) {
      if (useCloudinary && item.itemImage.includes('cloudinary.com')) {
        // Xóa từ Cloudinary
        const publicId = extractPublicIdFromUrl(item.itemImage);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } else {
        // Xóa file local
        const imagePath = path.join(__dirname, '../../', item.itemImage);
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
          } catch (err) {
            console.error('Error deleting item image:', err);
          }
        }
      }
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

// Upload item image
exports.uploadItemImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { itemId } = req.params;

    const item = await Item.findByPk(itemId);

    if (!item) {
      // Xóa file vừa upload nếu item không tồn tại
      if (useCloudinary && req.file.cloudinary) {
        await deleteFromCloudinary(req.file.cloudinary.publicId);
      } else {
        const filePath = path.join(__dirname, '../../', req.file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check ownership
    const store = await Store.findOne({
      where: { userId: req.user.id }
    });

    if (!store || item.storeId !== store.id) {
      // Xóa file vừa upload nếu không có quyền
      if (useCloudinary && req.file.cloudinary) {
        await deleteFromCloudinary(req.file.cloudinary.publicId);
      } else {
        const filePath = path.join(__dirname, '../../', req.file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Xóa ảnh cũ nếu có
    if (item.itemImage) {
      if (useCloudinary && item.itemImage.includes('cloudinary.com')) {
        const publicId = extractPublicIdFromUrl(item.itemImage);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } else {
        const oldImagePath = path.join(__dirname, '../../', item.itemImage);
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (err) {
            console.error('Error deleting old item image:', err);
          }
        }
      }
    }

    // Cập nhật ảnh mới
    const imagePath = req.file.cloudinary ? req.file.cloudinary.url : ('/uploads/' + req.file.filename);
    
    await item.update({ itemImage: imagePath });
    await item.reload();

    // Tạo full URL cho ảnh
    const getImageUrl = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      if (process.env.NODE_ENV === 'production') {
        let backendUrl = process.env.BACKEND_URL;
        if (!backendUrl) {
          const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
          backendUrl = `${protocol}://${req.get('host')}`;
        }
        backendUrl = backendUrl.replace(/\/$/, '');
        const cleanPath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
        return backendUrl + cleanPath;
      }
      return imagePath;
    };

    const imageUrl = getImageUrl(item.itemImage);

    res.json({
      success: true,
      message: 'Item image uploaded successfully',
      data: {
        itemImage: imageUrl,
        itemImagePath: item.itemImage
      }
    });
  } catch (error) {
    console.error('Upload item image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload item image',
      error: error.message
    });
  }
};

// Delete item image
exports.deleteItemImage = async (req, res) => {
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

    if (!store || item.storeId !== store.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Xóa ảnh nếu có
    if (item.itemImage) {
      if (useCloudinary && item.itemImage.includes('cloudinary.com')) {
        const publicId = extractPublicIdFromUrl(item.itemImage);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } else {
        const imagePath = path.join(__dirname, '../../', item.itemImage);
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
          } catch (err) {
            console.error('Error deleting item image:', err);
          }
        }
      }

      // Cập nhật item để xóa đường dẫn ảnh
      await item.update({ itemImage: null });
      await item.reload();
    }

    res.json({
      success: true,
      message: 'Item image deleted successfully',
      data: item
    });
  } catch (error) {
    console.error('Delete item image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item image',
      error: error.message
    });
  }
};
