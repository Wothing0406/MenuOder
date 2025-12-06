-- Create Database
CREATE DATABASE IF NOT EXISTS menu_order_db;
USE menu_order_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  storeName VARCHAR(255) NOT NULL,
  storePhone VARCHAR(20),
  storeAddress TEXT,
  role ENUM('store_owner', 'admin') NOT NULL DEFAULT 'store_owner',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  storeName VARCHAR(255) NOT NULL,
  storeSlug VARCHAR(255) UNIQUE NOT NULL,
  storePhone VARCHAR(20),
  storeAddress TEXT,
  storeDescription TEXT,
  storeLogo VARCHAR(255),
  storeImage VARCHAR(255),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_storeSlug (storeSlug),
  INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  storeId INT NULL,
  code VARCHAR(100) NOT NULL,
  description TEXT,
  discountType ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
  discountValue DECIMAL(10, 2) NOT NULL,
  minOrderAmount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  maxDiscountAmount DECIMAL(10, 2),
  usageLimit INT NULL,
  usageCount INT NOT NULL DEFAULT 0,
  neverExpires BOOLEAN NOT NULL DEFAULT false,
  startsAt DATETIME NULL,
  expiresAt DATETIME NULL,
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdBy INT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uniq_store_code (storeId, code),
  INDEX idx_code (code),
  INDEX idx_store (storeId),
  INDEX idx_voucher_status (isActive, expiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  storeId INT NOT NULL,
  categoryName VARCHAR(255) NOT NULL,
  categoryDescription TEXT,
  displayOrder INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE,
  INDEX idx_storeId (storeId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoryId INT NOT NULL,
  storeId INT NOT NULL,
  itemName VARCHAR(255) NOT NULL,
  itemDescription TEXT,
  itemPrice DECIMAL(10, 2) NOT NULL,
  itemImage VARCHAR(255),
  isAvailable BOOLEAN DEFAULT true,
  displayOrder INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE,
  INDEX idx_categoryId (categoryId),
  INDEX idx_storeId (storeId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Item Options table
CREATE TABLE IF NOT EXISTS item_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  itemId INT NOT NULL,
  optionName VARCHAR(255) NOT NULL,
  optionType ENUM('select', 'multiselect', 'text') DEFAULT 'select',
  optionValues JSON,
  isRequired BOOLEAN DEFAULT false,
  displayOrder INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE,
  INDEX idx_itemId (itemId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Item Accompaniments table
CREATE TABLE IF NOT EXISTS item_accompaniments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  itemId INT NOT NULL,
  accompanimentName VARCHAR(255) NOT NULL,
  accompanimentPrice DECIMAL(10, 2) NOT NULL DEFAULT 0,
  isOptional BOOLEAN DEFAULT true,
  displayOrder INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE,
  INDEX idx_itemId (itemId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  storeId INT NOT NULL,
  orderCode VARCHAR(255) UNIQUE NOT NULL,
  customerName VARCHAR(255),
  customerPhone VARCHAR(20),
  customerEmail VARCHAR(255),
  customerNote TEXT,
  orderType ENUM('dine_in', 'delivery') NOT NULL DEFAULT 'dine_in',
  deliveryAddress TEXT,
  deliveryDistance DECIMAL(10, 2),
  shippingFee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tableNumber INT,
  totalAmount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled') DEFAULT 'pending',
  paymentMethod ENUM('cash', 'bank_transfer', 'credit_card') DEFAULT 'cash',
  isPaid BOOLEAN DEFAULT false,
  voucherId INT NULL,
  voucherCode VARCHAR(100),
  discountType ENUM('percentage', 'fixed'),
  discountValue DECIMAL(10, 2),
  discountAmount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (voucherId) REFERENCES vouchers(id) ON DELETE SET NULL,
  INDEX idx_storeId (storeId),
  INDEX idx_orderCode (orderCode),
  INDEX idx_voucherCode (voucherCode),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  itemId INT NULL COMMENT 'Can be NULL if item is deleted, but order history is preserved',
  itemName VARCHAR(255) NOT NULL,
  itemPrice DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  selectedOptions JSON,
  selectedAccompaniments JSON,
  notes TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE SET NULL,
  INDEX idx_orderId (orderId),
  INDEX idx_itemId (itemId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for performance
CREATE INDEX idx_orders_store_status ON orders(storeId, status);
CREATE INDEX idx_items_store_available ON items(storeId, isAvailable);
CREATE INDEX idx_categories_store ON categories(storeId);
