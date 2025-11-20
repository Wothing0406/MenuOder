const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Store = require('../models/Store');
const { generateToken } = require('../utils/jwt');

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, storeName, storePhone, storeAddress } = req.body;

    // Validate input
    if (!email || !password || !storeName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and store name are required'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      storeName,
      storePhone,
      storeAddress
    });

    // Generate unique store slug
    const storeSlug = `${storeName.toLowerCase().replace(/\s+/g, '-')}-${user.id}`;

    // Create store
    const store = await Store.create({
      userId: user.id,
      storeName,
      storeSlug,
      storePhone,
      storeAddress
    });

    const token = generateToken(user.id);

    res.status(201).json({
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
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
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
