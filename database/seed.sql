-- Seed Data Script
-- Thêm dữ liệu mẫu vào database

USE menu_order_db;

-- Xóa dữ liệu cũ (nếu có)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE item_accompaniments;
TRUNCATE TABLE item_options;
TRUNCATE TABLE items;
TRUNCATE TABLE categories;
TRUNCATE TABLE stores;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Thêm User và Store mẫu
-- Password: password123 (đã hash bằng bcrypt)
-- Hash này sẽ được generate tự động bởi script reset-db.js
-- Tạm thời sử dụng hash mẫu, script sẽ thay thế bằng hash thật
INSERT INTO users (email, password, storeName, storePhone, storeAddress, createdAt, updatedAt) VALUES
('admin@restaurant.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nhà Hàng Mẫu', '0123456789', '123 Đường ABC, Quận 1, TP.HCM', NOW(), NOW());

SET @userId = LAST_INSERT_ID();

INSERT INTO stores (userId, storeName, storeSlug, storePhone, storeAddress, storeDescription, isActive, createdAt, updatedAt) VALUES
(@userId, 'Nhà Hàng Mẫu', 'nha-hang-mau', '0123456789', '123 Đường ABC, Quận 1, TP.HCM', 'Nhà hàng phục vụ các món ăn Việt Nam và Á Đông', true, NOW(), NOW());

SET @storeId = LAST_INSERT_ID();

-- Thêm Categories
INSERT INTO categories (storeId, categoryName, categoryDescription, displayOrder, createdAt, updatedAt) VALUES
(@storeId, 'Món Khai Vị', 'Các món khai vị ngon miệng', 1, NOW(), NOW()),
(@storeId, 'Món Chính', 'Các món chính đặc biệt', 2, NOW(), NOW()),
(@storeId, 'Đồ Uống', 'Nước uống giải khát', 3, NOW(), NOW()),
(@storeId, 'Tráng Miệng', 'Các món tráng miệng ngọt ngào', 4, NOW(), NOW());

SET @catKhaiVi = (SELECT id FROM categories WHERE categoryName = 'Món Khai Vị' AND storeId = @storeId);
SET @catMonChinh = (SELECT id FROM categories WHERE categoryName = 'Món Chính' AND storeId = @storeId);
SET @catDoUong = (SELECT id FROM categories WHERE categoryName = 'Đồ Uống' AND storeId = @storeId);
SET @catTrangMieng = (SELECT id FROM categories WHERE categoryName = 'Tráng Miệng' AND storeId = @storeId);

-- Thêm Items
INSERT INTO items (categoryId, storeId, itemName, itemDescription, itemPrice, isAvailable, displayOrder, createdAt, updatedAt) VALUES
-- Món Khai Vị
(@catKhaiVi, @storeId, 'Gỏi Cuốn', 'Gỏi cuốn tôm thịt tươi ngon', 35000.00, true, 1, NOW(), NOW()),
(@catKhaiVi, @storeId, 'Nem Nướng', 'Nem nướng thơm ngon', 45000.00, true, 2, NOW(), NOW()),
(@catKhaiVi, @storeId, 'Chả Giò', 'Chả giò giòn tan', 40000.00, true, 3, NOW(), NOW()),

-- Món Chính
(@catMonChinh, @storeId, 'Phở Bò', 'Phở bò truyền thống', 65000.00, true, 1, NOW(), NOW()),
(@catMonChinh, @storeId, 'Bún Bò Huế', 'Bún bò Huế đậm đà', 70000.00, true, 2, NOW(), NOW()),
(@catMonChinh, @storeId, 'Cơm Gà', 'Cơm gà thơm ngon', 75000.00, true, 3, NOW(), NOW()),
(@catMonChinh, @storeId, 'Bánh Mì Thịt Nướng', 'Bánh mì thịt nướng đặc biệt', 50000.00, true, 4, NOW(), NOW()),
(@catMonChinh, @storeId, 'Gà Chiên', 'Gà chiên giòn, 6 đùi', 100000.00, true, 5, NOW(), NOW()),

-- Đồ Uống
(@catDoUong, @storeId, 'Nước Ngọt', 'Coca, Pepsi, 7Up', 20000.00, true, 1, NOW(), NOW()),
(@catDoUong, @storeId, 'Nước Cam', 'Nước cam ép tươi', 35000.00, true, 2, NOW(), NOW()),
(@catDoUong, @storeId, 'Trà Đá', 'Trà đá mát lạnh', 10000.00, true, 3, NOW(), NOW()),
(@catDoUong, @storeId, 'Cà Phê Đen', 'Cà phê đen đậm đà', 25000.00, true, 4, NOW(), NOW()),

-- Tráng Miệng
(@catTrangMieng, @storeId, 'Chè Đậu Xanh', 'Chè đậu xanh ngọt ngào', 30000.00, true, 1, NOW(), NOW()),
(@catTrangMieng, @storeId, 'Bánh Flan', 'Bánh flan mềm mịn', 35000.00, true, 2, NOW(), NOW()),
(@catTrangMieng, @storeId, 'Kem Dừa', 'Kem dừa mát lạnh', 40000.00, true, 3, NOW(), NOW());

-- Thêm Item Options cho Gà Chiên
SET @gaChienId = (SELECT id FROM items WHERE itemName = 'Gà Chiên' AND storeId = @storeId);

INSERT INTO item_options (itemId, optionName, optionType, optionValues, isRequired, displayOrder, createdAt, updatedAt) VALUES
(@gaChienId, 'Size', 'select', JSON_ARRAY(
  JSON_OBJECT('name', 'Nhỏ (3 đùi)', 'price', 0),
  JSON_OBJECT('name', 'Vừa (6 đùi)', 'price', 0),
  JSON_OBJECT('name', 'Lớn (9 đùi)', 'price', 50000)
), true, 1, NOW(), NOW());

-- Thêm Item Accompaniments cho Gà Chiên
INSERT INTO item_accompaniments (itemId, accompanimentName, accompanimentPrice, isOptional, displayOrder, createdAt, updatedAt) VALUES
(@gaChienId, 'Khoai tây chiên', 20000.00, true, 1, NOW(), NOW()),
(@gaChienId, 'Salad rau củ', 15000.00, true, 2, NOW(), NOW()),
(@gaChienId, 'Nước chấm đặc biệt', 5000.00, true, 3, NOW(), NOW());

-- Thêm Item Options cho Phở Bò
SET @phoBoId = (SELECT id FROM items WHERE itemName = 'Phở Bò' AND storeId = @storeId);

INSERT INTO item_options (itemId, optionName, optionType, optionValues, isRequired, displayOrder, createdAt, updatedAt) VALUES
(@phoBoId, 'Size', 'select', JSON_ARRAY(
  JSON_OBJECT('name', 'Nhỏ', 'price', 0),
  JSON_OBJECT('name', 'Vừa', 'price', 10000),
  JSON_OBJECT('name', 'Lớn', 'price', 20000)
), true, 1, NOW(), NOW()),
(@phoBoId, 'Độ Chín', 'select', JSON_ARRAY(
  JSON_OBJECT('name', 'Tái', 'price', 0),
  JSON_OBJECT('name', 'Chín vừa', 'price', 0),
  JSON_OBJECT('name', 'Chín kỹ', 'price', 0)
), false, 2, NOW(), NOW());

-- Thêm Item Accompaniments cho Phở Bò
INSERT INTO item_accompaniments (itemId, accompanimentName, accompanimentPrice, isOptional, displayOrder, createdAt, updatedAt) VALUES
(@phoBoId, 'Thêm bò', 30000.00, true, 1, NOW(), NOW()),
(@phoBoId, 'Thêm bánh phở', 10000.00, true, 2, NOW(), NOW()),
(@phoBoId, 'Quẩy', 15000.00, true, 3, NOW(), NOW());

SELECT 'Seed data đã được thêm thành công!' AS message;

