const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isCloudinaryConfigured } = require('../utils/cloudinary');

// Kiểm tra xem có sử dụng Cloudinary không
const useCloudinary = isCloudinaryConfigured();

if (useCloudinary) {
  console.log('📦 Using Cloudinary for file storage');
} else {
  console.log('💾 Using local file storage');
}

// Đảm bảo thư mục uploads tồn tại (cho local storage)
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage - luôn dùng local storage cho multer
// Cloudinary upload sẽ được xử lý riêng trong routes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file unique với timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    // Kiểm tra field name để đặt tên file phù hợp
    const prefix = file.fieldname === 'storeImage' ? 'store-image-' : 'logo-';
    cb(null, prefix + uniqueSuffix + ext);
  }
});

// Filter chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
  // Kiểm tra MIME type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh!'), false);
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = {
  upload,
  useCloudinary
};



