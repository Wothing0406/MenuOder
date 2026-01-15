# Cơ Sở Dữ Liệu MenuOrder

## Tổng Quan

MenuOrder sử dụng cơ sở dữ liệu quan hệ với thiết kế normalized để đảm bảo tính toàn vẹn dữ liệu và performance tối ưu.

## Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 MENU ORDER DATABASE                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Tables: 11                           Relations: 15                           │
│ Indexes: 25                           Triggers: 0                             │
│ Constraints: 20                        Views: 0                               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    USERS    │       │   STORES    │       │ CATEGORIES  │
│             │1    1 │             │1    N │             │
│ id (PK)     │◄──────┤ id (PK)     │◄──────┤ id (PK)     │
│ email (UQ)  │       │ userId (FK) │       │ storeId (FK)│
│ password    │       │ storeName   │       │ categoryName│
│ storeName   │       │ storeSlug   │       │ displayOrder│
│ role        │       │ storePhone  │       │             │
│ createdAt   │       │ storeAddress│       │             │
│ updatedAt   │       │ storeDesc   │       │             │
│             │       │ storeLogo   │       │             │
│             │       │ storeImage  │       │             │
│             │       │ isActive    │       │             │
└─────────────┘       └─────────────┘       └─────────────┘
                                                        │
                                                        │1
                                                        │N
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    ITEMS    │       │ITEM_OPTIONS │       │    ORDERS   │
│             │1    N │             │       │             │
│ id (PK)     │◄──────┤ id (PK)     │       │ id (PK)     │
│ categoryId  │       │ itemId (FK) │       │ storeId (FK)│
│ storeId (FK)│       │ optionName  │       │ orderCode   │
│ itemName    │       │ optionType  │       │ customerName│
│ itemDesc    │       │ optionValues│       │ customerPhone
│ itemPrice   │       │ isRequired  │       │ orderType   │
│ itemImage   │       │ displayOrder│       │ deliveryAddr│
│ isAvailable │       │             │       │ shippingFee │
│ displayOrder│       │             │       │ totalAmount │
└─────────────┘       └─────────────┘       │ status      │
     │                                      │ paymentMethod
     │1                                     │ isPaid      │
     │N                                     │ voucherId   │
     ▼                                      └─────────────┘
┌─────────────┐                                     │
│ITEM_ACCOMPA-│                                     │1
│ NIMENTS     │                                     │N
│             │                                     ▼
│ id (PK)     │                            ┌─────────────┐
│ itemId (FK) │                            │ORDER_ITEMS  │
│ accompName  │                            │             │
│ accompPrice │                            │ id (PK)     │
│ isOptional  │                            │ orderId (FK)│
│ displayOrder│                            │ itemId (FK) │
└─────────────┘                            │ itemName    │
                                           │ itemPrice   │
                                           │ quantity    │
                                           │ selectedOpts│
                                           │ subtotal    │
                                           └─────────────┘
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  VOUCHERS   │       │   REVIEWS   │       │PAYMENT_ACCT │
│             │       │             │       │             │
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ storeId (FK)│       │ storeId (FK)│       │ storeId (FK)│
│ code        │       │ itemId (FK) │       │ accountType │
│ description │       │ orderId (FK)│       │ accountName │
│ discountType│       │ rating      │       │ accountNum  │
│ discountVal │       │ comment     │       │ bankName    │
│ minOrderAmt │       │             │       │ qrImage     │
│ maxDiscount │       │             │       │ isActive    │
│ usageLimit  │       │             │       │             │
│ usageCount  │       │             │       │             │
│ neverExpires│       │             │       │             │
│ startsAt    │       │             │       │             │
│ expiresAt   │       │             │       │             │
│ isActive    │       │             │       │             │
└─────────────┘       └─────────────┘       └─────────────┘
```

## Table Details

### 1. users
**Mô tả:** Thông tin tài khoản chủ quán

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID duy nhất |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email đăng nhập |
| password | VARCHAR(255) | NOT NULL | Mật khẩu đã hash |
| storeName | VARCHAR(255) | NOT NULL | Tên cửa hàng |
| storePhone | VARCHAR(20) | - | Số điện thoại |
| storeAddress | TEXT | - | Địa chỉ |
| role | ENUM | NOT NULL, DEFAULT 'store_owner' | Vai trò |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian tạo |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Thời gian cập nhật |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY (email)
- INDEX idx_email (email)

### 2. stores
**Mô tả:** Thông tin cửa hàng

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID duy nhất |
| userId | INT | NOT NULL, UNIQUE | Chủ sở hữu |
| storeName | VARCHAR(255) | NOT NULL | Tên cửa hàng |
| storeSlug | VARCHAR(255) | UNIQUE, NOT NULL | Slug URL |
| storePhone | VARCHAR(20) | - | Số điện thoại |
| storeAddress | TEXT | - | Địa chỉ |
| storeDescription | TEXT | - | Mô tả |
| storeLogo | VARCHAR(255) | - | URL logo |
| storeImage | VARCHAR(255) | - | URL ảnh cửa hàng |
| isActive | BOOLEAN | DEFAULT true | Trạng thái hoạt động |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian tạo |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Thời gian cập nhật |

**Foreign Keys:**
- userId → users.id (CASCADE)

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY (storeSlug)
- INDEX idx_userId (userId)

### 3. categories
**Mô tả:** Danh mục món ăn

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID duy nhất |
| storeId | INT | NOT NULL | Cửa hàng sở hữu |
| categoryName | VARCHAR(255) | NOT NULL | Tên danh mục |
| categoryDescription | TEXT | - | Mô tả danh mục |
| displayOrder | INT | DEFAULT 0 | Thứ tự hiển thị |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian tạo |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Thời gian cập nhật |

**Foreign Keys:**
- storeId → stores.id (CASCADE)

### 4. items
**Mô tả:** Thông tin món ăn

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID duy nhất |
| categoryId | INT | NOT NULL | Danh mục chứa |
| storeId | INT | NOT NULL | Cửa hàng sở hữu |
| itemName | VARCHAR(255) | NOT NULL | Tên món |
| itemDescription | TEXT | - | Mô tả món |
| itemPrice | DECIMAL(10,2) | NOT NULL | Giá món |
| itemImage | VARCHAR(255) | - | URL ảnh |
| isAvailable | BOOLEAN | DEFAULT true | Còn bán |
| displayOrder | INT | DEFAULT 0 | Thứ tự hiển thị |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian tạo |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Thời gian cập nhật |

**Foreign Keys:**
- categoryId → categories.id (CASCADE)
- storeId → stores.id (CASCADE)

### 5. item_options
**Mô tả:** Tùy chọn món ăn (size, topping)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID duy nhất |
| itemId | INT | NOT NULL | Món áp dụng |
| optionName | VARCHAR(255) | NOT NULL | Tên tùy chọn |
| optionType | ENUM | DEFAULT 'select' | Loại tùy chọn |
| optionValues | JSON | - | Giá trị tùy chọn |
| isRequired | BOOLEAN | DEFAULT false | Bắt buộc |
| displayOrder | INT | DEFAULT 0 | Thứ tự hiển thị |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian tạo |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Thời gian cập nhật |

**Foreign Keys:**
- itemId → items.id (CASCADE)

### 6. item_accompaniments
**Mô tả:** Món ăn kèm

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID duy nhất |
| itemId | INT | NOT NULL | Món chính |
| accompanimentName | VARCHAR(255) | NOT NULL | Tên món kèm |
| accompanimentPrice | DECIMAL(10,2) | DEFAULT 0 | Giá món kèm |
| isOptional | BOOLEAN | DEFAULT true | Tùy chọn |
| displayOrder | INT | DEFAULT 0 | Thứ tự hiển thị |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian tạo |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Thời gian cập nhật |

**Foreign Keys:**
- itemId → items.id (CASCADE)

### 7. orders
**Mô tả:** Thông tin đơn hàng

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID duy nhất |
| storeId | INT | NOT NULL | Cửa hàng |
| orderCode | VARCHAR(255) | UNIQUE, NOT NULL | Mã đơn |
| customerName | VARCHAR(255) | - | Tên khách |
| customerPhone | VARCHAR(20) | - | SĐT khách |
| customerEmail | VARCHAR(255) | - | Email khách |
| customerNote | TEXT | - | Ghi chú |
| orderType | ENUM | NOT NULL, DEFAULT 'dine_in' | Loại đơn |
| deliveryAddress | TEXT | - | Địa chỉ giao |
| deliveryDistance | DECIMAL(10,2) | - | Khoảng cách |
| shippingFee | DECIMAL(10,2) | DEFAULT 0 | Phí ship |
| tableNumber | INT | - | Số bàn |
| totalAmount | DECIMAL(10,2) | NOT NULL | Tổng tiền |
| status | ENUM | DEFAULT 'pending' | Trạng thái |
| paymentMethod | ENUM | DEFAULT 'cash' | Phương thức TT |
| isPaid | BOOLEAN | DEFAULT false | Đã thanh toán |
| voucherId | INT | - | Voucher áp dụng |
| voucherCode | VARCHAR(100) | - | Mã voucher |
| discountType | ENUM | - | Loại giảm giá |
| discountValue | DECIMAL(10,2) | - | Giá trị giảm |
| discountAmount | DECIMAL(10,2) | DEFAULT 0 | Số tiền giảm |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian tạo |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Thời gian cập nhật |

### 8. order_items
**Mô tả:** Chi tiết món trong đơn hàng

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID duy nhất |
| orderId | INT | NOT NULL | Đơn hàng |
| itemId | INT | - | Món ăn (có thể NULL) |
| itemName | VARCHAR(255) | NOT NULL | Tên món |
| itemPrice | DECIMAL(10,2) | NOT NULL | Giá món |
| quantity | INT | DEFAULT 1 | Số lượng |
| selectedOptions | JSON | - | Tùy chọn đã chọn |
| selectedAccompaniments | JSON | - | Món kèm đã chọn |
| notes | TEXT | - | Ghi chú món |
| subtotal | DECIMAL(10,2) | NOT NULL | Thành tiền |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian tạo |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Thời gian cập nhật |

### 9. vouchers
**Mô tả:** Mã giảm giá

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID duy nhất |
| storeId | INT | - | Cửa hàng |
| code | VARCHAR(100) | NOT NULL | Mã voucher |
| description | TEXT | - | Mô tả |
| discountType | ENUM | NOT NULL, DEFAULT 'percentage' | Loại giảm |
| discountValue | DECIMAL(10,2) | NOT NULL | Giá trị giảm |
| minOrderAmount | DECIMAL(10,2) | DEFAULT 0 | Đơn tối thiểu |
| maxDiscountAmount | DECIMAL(10,2) | - | Giảm tối đa |
| usageLimit | INT | - | Số lần sử dụng |
| usageCount | INT | DEFAULT 0 | Đã sử dụng |
| neverExpires | BOOLEAN | DEFAULT false | Không hết hạn |
| startsAt | DATETIME | - | Thời gian bắt đầu |
| expiresAt | DATETIME | - | Thời gian hết hạn |
| isActive | BOOLEAN | DEFAULT true | Hoạt động |
| createdBy | INT | - | Người tạo |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian tạo |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Thời gian cập nhật |

### 10. reviews
**Mô tả:** Đánh giá món ăn/đơn hàng

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID duy nhất |
| storeId | INT | NOT NULL | Cửa hàng |
| itemId | INT | - | Món được đánh giá |
| orderId | INT | - | Đơn hàng |
| rating | INT | - | Số sao (1-5) |
| comment | TEXT | - | Nội dung đánh giá |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian tạo |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Thời gian cập nhật |

### 11. payment_accounts
**Mô tả:** Tài khoản thanh toán

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID duy nhất |
| storeId | INT | NOT NULL | Cửa hàng |
| accountType | ENUM | NOT NULL | Loại tài khoản |
| accountName | VARCHAR(255) | NOT NULL | Tên chủ tài khoản |
| accountNumber | VARCHAR(50) | NOT NULL | Số tài khoản |
| bankName | VARCHAR(255) | - | Tên ngân hàng |
| qrImage | VARCHAR(255) | - | URL QR code |
| isActive | BOOLEAN | DEFAULT true | Hoạt động |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian tạo |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Thời gian cập nhật |

## Performance Indexes

### Composite Indexes
```sql
CREATE INDEX idx_orders_store_status ON orders(storeId, status);
CREATE INDEX idx_items_store_available ON items(storeId, isAvailable);
CREATE INDEX idx_categories_store ON categories(storeId);
CREATE INDEX idx_orders_store_created ON orders(storeId, createdAt);
```

### Foreign Key Indexes
- Tự động tạo cho tất cả foreign keys
- Đảm bảo referential integrity

## Data Types & Constraints

### Numeric Types
- IDs: INT AUTO_INCREMENT
- Prices: DECIMAL(10,2) cho độ chính xác 2 chữ số thập phân
- Quantities: INT cho số nguyên

### String Types
- VARCHAR(255) cho text ngắn
- TEXT cho text dài không giới hạn
- ENUM cho các giá trị cố định

### Date/Time Types
- TIMESTAMP cho createdAt/updatedAt
- DATETIME cho thời gian tùy chỉnh

### JSON Types
- optionValues: Lưu cấu trúc tùy chọn phức tạp
- selectedOptions: Lưu tùy chọn đã chọn

## Migration Strategy

### Version Control
- File-based migrations
- Up/Down scripts
- Rollback support

### Data Seeding
- Initial data cho development
- Sample stores, categories, items
- Test orders và reviews

### Backup & Recovery
- Automated backup scripts
- Point-in-time recovery
- Schema-only dumps











