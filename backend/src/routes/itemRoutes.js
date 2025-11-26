const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authMiddleware = require('../middleware/auth');
const { upload, useCloudinary } = require('../middleware/upload');

// Public routes
router.get('/category/:categoryId', itemController.getItemsByCategory);
router.get('/:itemId', itemController.getItemDetail);

// Sử dụng upload middleware phù hợp
const uploadMiddleware = useCloudinary 
  ? (fieldName) => {
      return async (req, res, next) => {
        const multer = require('multer');
        const { uploadBufferToCloudinary } = require('../utils/cloudinary');
        
        const memoryStorage = multer.memoryStorage();
        const upload = multer({
          storage: memoryStorage,
          fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
              cb(null, true);
            } else {
              cb(new Error('Chỉ cho phép upload file ảnh!'), false);
            }
          },
          limits: { fileSize: 5 * 1024 * 1024 }
        });

        upload.single(fieldName)(req, res, async (err) => {
          if (err) return next(err);
          if (!req.file) return next();

          try {
            let folder = 'menu-order/item-images';

            const result = await uploadBufferToCloudinary(
              req.file.buffer,
              folder,
              req.file.originalname
            );

            req.file.cloudinary = {
              url: result.url,
              publicId: result.publicId
            };
            req.file.path = result.url;
            req.file.location = result.url;

            next();
          } catch (error) {
            console.error('Cloudinary upload error:', error);
            return next(error);
          }
        });
      };
    }
  : (fieldName) => {
      // Cho local storage, đảm bảo prefix là item-image-
      const multer = require('multer');
      const path = require('path');
      const fs = require('fs');
      
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = path.extname(file.originalname);
          cb(null, 'item-image-' + uniqueSuffix + ext);
        }
      });

      const uploadInstance = multer({
        storage: storage,
        fileFilter: (req, file, cb) => {
          if (file.mimetype.startsWith('image/')) {
            cb(null, true);
          } else {
            cb(new Error('Chỉ cho phép upload file ảnh!'), false);
          }
        },
        limits: { fileSize: 5 * 1024 * 1024 }
      });

      // Trả về middleware function
      return uploadInstance.single(fieldName);
    };

// Protected routes
router.post('/', authMiddleware, uploadMiddleware('itemImage'), itemController.createItem);
router.put('/:itemId', authMiddleware, uploadMiddleware('itemImage'), itemController.updateItem);
router.delete('/:itemId', authMiddleware, itemController.deleteItem);
router.post('/:itemId/image', authMiddleware, uploadMiddleware('itemImage'), itemController.uploadItemImage);
router.delete('/:itemId/image', authMiddleware, itemController.deleteItemImage);

module.exports = router;
