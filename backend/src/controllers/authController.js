const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Store = require('../models/Store');
const { generateToken } = require('../utils/jwt');
const { sequelize } = require('../config/database');
// Use OpenStreetMap (FREE) instead of Google Maps
const { extractAddressFromGoogleMapsLink } = require('../utils/openStreetMap');

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, storeName, storePhone, storeAddress, storeGoogleMapLink } = req.body;

    // Validate input (no transaction needed for validation)
    if (!email || !password || !storeName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and store name are required'
      });
    }

    // Check if user exists (no transaction needed for read-only check)
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Validate that address is provided (either from Google Maps link or manual input)
    if (!storeAddress || storeAddress.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Địa chỉ cửa hàng là bắt buộc. Vui lòng nhập địa chỉ vào trường "Địa chỉ cửa hàng".'
      });
    }

    // If Google Maps link is provided, try to extract address from it (optional)
    // But always use manually entered address if provided (more accurate)
    let finalAddress = storeAddress.trim();
    
    if (storeGoogleMapLink && storeGoogleMapLink.trim()) {
      try {
        console.log('Attempting to extract address from Google Maps link:', storeGoogleMapLink.trim());
        const extractedAddress = await extractAddressFromGoogleMapsLink(storeGoogleMapLink.trim());
        
        // Only use extracted address if user didn't manually enter one
        // Or if extracted address seems more complete
        if (!storeAddress || storeAddress.trim() === '') {
          finalAddress = extractedAddress;
          console.log('Using extracted address from Google Maps link:', extractedAddress);
        } else {
          // User provided manual address, keep it (more reliable)
          console.log('Keeping manually entered address (more reliable):', finalAddress);
        }
      } catch (error) {
        console.error('Error extracting address from Google Maps link:', error.message);
        // Continue with manually entered address - don't fail registration
        console.log('Using manually entered address due to extraction error:', finalAddress);
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use transaction to ensure atomicity (only for write operations)
    const transaction = await sequelize.transaction();
    
    try {
      // Create user within transaction
      const user = await User.create({
        email,
        password: hashedPassword,
        storeName,
        storePhone,
        storeAddress: finalAddress
      }, { transaction });

      // Generate unique store slug - check for duplicates
      let baseSlug = `${storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
      let storeSlug = `${baseSlug}-${user.id}`;
      let slugExists = await Store.findOne({ where: { storeSlug }, transaction });
      let counter = 1;
      
      // If slug exists (shouldn't happen with user.id, but just in case), append counter
      while (slugExists) {
        storeSlug = `${baseSlug}-${user.id}-${counter}`;
        slugExists = await Store.findOne({ where: { storeSlug }, transaction });
        counter++;
      }

      // Create store within transaction
      const store = await Store.create({
        userId: user.id,
        storeName,
        storeSlug,
        storePhone,
        storeAddress: finalAddress,
        storeGoogleMapLink: storeGoogleMapLink?.trim() || null
      }, { transaction });

      // Commit transaction
      await transaction.commit();

      const token = generateToken(user.id);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            storeName: user.storeName
          },
          store: {
            id: store.id,
            storeSlug: store.storeSlug
          },
          token
        }
      });
    } catch (transactionError) {
      // Rollback transaction on any error
      await transaction.rollback();
      throw transactionError; // Re-throw to be caught by outer catch
    }

  } catch (error) {
    console.error('Register error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Đăng ký thất bại';
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      if (error.errors && error.errors[0]) {
        const field = error.errors[0].path;
        if (field === 'email') {
          errorMessage = 'Email đã được đăng ký. Vui lòng sử dụng email khác.';
        } else if (field === 'storeSlug') {
          errorMessage = 'Tên cửa hàng đã tồn tại. Vui lòng thử tên khác.';
        } else {
          errorMessage = `Trường ${field} đã tồn tại. Vui lòng thử giá trị khác.`;
        }
      } else {
        errorMessage = 'Dữ liệu đã tồn tại trong hệ thống. Vui lòng kiểm tra lại.';
      }
    } else if (error.name === 'SequelizeValidationError') {
      errorMessage = 'Dữ liệu không hợp lệ: ' + (error.errors.map(e => e.message).join(', ') || error.message);
    } else if (error.name === 'SequelizeDatabaseError') {
      // Check if it's a column error (e.g., storeGoogleMapLink doesn't exist)
      if (error.message.includes('storeGoogleMapLink') || error.message.includes('Unknown column')) {
        errorMessage = 'Lỗi cấu hình database. Vui lòng chạy migration để thêm cột storeGoogleMapLink vào bảng stores.';
      } else {
        errorMessage = 'Lỗi database. Vui lòng kiểm tra cấu hình database hoặc liên hệ quản trị viên.';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get user's store
    const store = await Store.findOne({ where: { userId: user.id } });

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          storeName: user.storeName
        },
        store: {
          id: store.id,
          storeSlug: store.storeSlug
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const store = await Store.findOne({ where: { userId: user.id } });

    res.json({
      success: true,
      data: {
        user,
        store
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};
