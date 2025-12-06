const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Kiểm tra xem Cloudinary đã được cấu hình chưa
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Tạo storage cho Cloudinary
const createCloudinaryStorage = (folder = 'menu-order') => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [
        {
          width: 1200,
          height: 1200,
          crop: 'limit',
          quality: 'auto'
        }
      ]
    }
  });
};

// Upload file lên Cloudinary
const uploadToCloudinary = async (filePath, folder = 'menu-order') => {
  try {
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary chưa được cấu hình. Vui lòng kiểm tra environment variables.');
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        {
          width: 1200,
          height: 1200,
          crop: 'limit',
          quality: 'auto'
        }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Upload buffer trực tiếp lên Cloudinary (không cần lưu file tạm)
const uploadBufferToCloudinary = async (buffer, folder = 'menu-order', filename = null) => {
  try {
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary chưa được cấu hình. Vui lòng kiểm tra environment variables.');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          public_id: filename ? filename.replace(/\.[^/.]+$/, '') : undefined,
          transformation: [
            {
              width: 1200,
              height: 1200,
              crop: 'limit',
              quality: 'auto'
            }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format
            });
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Cloudinary buffer upload error:', error);
    throw error;
  }
};

// Xóa file từ Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!isCloudinaryConfigured()) {
      console.warn('Cloudinary chưa được cấu hình, không thể xóa file');
      return false;
    }

    if (!publicId) {
      return false;
    }

    // Nếu publicId là URL, extract public_id từ URL
    let actualPublicId = publicId;
    if (publicId.includes('cloudinary.com')) {
      // Extract public_id từ URL: https://res.cloudinary.com/xxx/image/upload/v123456/folder/image.jpg
      const urlParts = publicId.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && urlParts[uploadIndex + 2]) {
        // Bỏ qua 'v123456' version
        actualPublicId = urlParts.slice(uploadIndex + 2).join('/').replace(/\.[^/.]+$/, '');
      }
    }

    const result = await cloudinary.uploader.destroy(actualPublicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

// Extract public_id từ URL
const extractPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) {
    return null;
  }

  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1 && urlParts[uploadIndex + 2]) {
      const publicId = urlParts.slice(uploadIndex + 2).join('/').replace(/\.[^/.]+$/, '');
      return publicId;
    }
  } catch (error) {
    console.error('Error extracting public_id:', error);
  }

  return null;
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  createCloudinaryStorage,
  uploadToCloudinary,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl
};







