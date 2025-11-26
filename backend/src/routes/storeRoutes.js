const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middleware/auth');
const { upload, useCloudinary } = require('../middleware/upload');

// Public route
router.get('/slug/:slug', storeController.getStoreBySlug);
router.get('/', storeController.getAllStores);

// Protected routes
router.get('/my-store', authMiddleware, storeController.getMyStore);

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
            let folder = 'menu-order';
            if (fieldName === 'storeImage') {
              folder = 'menu-order/store-images';
            } else if (fieldName === 'logo') {
              folder = 'menu-order/logos';
            }

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
  : (fieldName) => upload.single(fieldName);

router.put('/my-store', authMiddleware, uploadMiddleware('logo'), storeController.updateStore);
router.post('/my-store/logo', authMiddleware, uploadMiddleware('logo'), storeController.uploadLogo);
router.post('/my-store/image', authMiddleware, uploadMiddleware('storeImage'), storeController.uploadStoreImage);

module.exports = router;
