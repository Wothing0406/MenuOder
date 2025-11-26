# 🗄️ Hướng Dẫn Reset & Cập Nhật Database Trên Render

## 📋 Tổng Quan

Render thường dùng **PostgreSQL** (không phải MySQL). Có 3 cách để reset/cập nhật database:

1. **Render Shell** (Khuyến nghị) - Chạy SQL trực tiếp
2. **Migration Scripts** - Chạy qua Node.js scripts
3. **Render Dashboard** - Dùng PostgreSQL dashboard

---

## 🚀 Cách 1: Dùng Render Shell (Nhanh Nhất)

### Bước 1: Vào Render Shell

1. Truy cập: https://dashboard.render.com
2. Chọn **PostgreSQL Database** service
3. Click tab **"Shell"** hoặc **"Connect"**
4. Hoặc vào **Backend Service** → **Shell**

### Bước 2: Kết Nối Database

Nếu dùng Render Shell từ Backend Service:

```bash
# Kết nối đến PostgreSQL
psql $DATABASE_URL
```

Hoặc nếu có thông tin riêng lẻ:

```bash
psql -h <DB_HOST> -U <DB_USER> -d <DB_NAME>
```

### Bước 3: Chạy SQL Commands

#### Reset Database (Xóa tất cả và tạo lại):

```sql
-- Xóa tất cả tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Chạy lại schema
\i /path/to/schema.sql
```

#### Thêm Cột Mới:

```sql
-- Ví dụ: Thêm cột storeGoogleMapLink vào bảng stores
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS storeGoogleMapLink VARCHAR(500) NULL;

-- Ví dụ: Thêm cột orderType vào bảng orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS orderType VARCHAR(20) NOT NULL DEFAULT 'dine_in';

-- Ví dụ: Thêm deliveryAddress
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS deliveryAddress TEXT NULL;

-- Ví dụ: Thêm deliveryDistance
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS deliveryDistance DECIMAL(10, 2) NULL;

-- Ví dụ: Thêm shippingFee
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shippingFee DECIMAL(10, 2) NOT NULL DEFAULT 0;
```

#### Sửa Cột (Cho phép NULL):

```sql
-- Cho phép customerName và customerPhone NULL
ALTER TABLE orders 
ALTER COLUMN customerName DROP NOT NULL,
ALTER COLUMN customerPhone DROP NOT NULL;
```

#### Xem Cấu Trúc Bảng:

```sql
-- Xem tất cả tables
\dt

-- Xem cấu trúc bảng cụ thể
\d stores
\d orders
```

---

## 🔧 Cách 2: Dùng Migration Scripts

### Bước 1: Tạo Script Migration Cho PostgreSQL

Tạo file `backend/scripts/apply-migration-postgres.js`:

```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

async function applyMigration() {
  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: console.log
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Migration 1: Thêm storeGoogleMapLink
    await sequelize.query(`
      ALTER TABLE stores 
      ADD COLUMN IF NOT EXISTS "storeGoogleMapLink" VARCHAR(500) NULL;
    `);
    console.log('✅ Added storeGoogleMapLink');

    // Migration 2: Thêm orderType
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS "orderType" VARCHAR(20) NOT NULL DEFAULT 'dine_in';
    `);
    console.log('✅ Added orderType');

    // Migration 3: Thêm deliveryAddress
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS "deliveryAddress" TEXT NULL;
    `);
    console.log('✅ Added deliveryAddress');

    // Migration 4: Thêm deliveryDistance
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS "deliveryDistance" DECIMAL(10, 2) NULL;
    `);
    console.log('✅ Added deliveryDistance');

    // Migration 5: Thêm shippingFee
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS "shippingFee" DECIMAL(10, 2) NOT NULL DEFAULT 0;
    `);
    console.log('✅ Added shippingFee');

    // Migration 6: Cho phép customerName và customerPhone NULL
    await sequelize.query(`
      ALTER TABLE orders 
      ALTER COLUMN "customerName" DROP NOT NULL,
      ALTER COLUMN "customerPhone" DROP NOT NULL;
    `);
    console.log('✅ Updated customerName and customerPhone to allow NULL');

    console.log('\n✅ All migrations applied successfully!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

applyMigration();
```

### Bước 2: Chạy Script Trên Render

**Option A: Dùng Render Shell**

1. Vào Backend Service → **Shell**
2. Chạy:
```bash
cd backend
node scripts/apply-migration-postgres.js
```

**Option B: Thêm vào Deploy Command**

1. Vào Backend Service → **Settings** → **Build & Deploy**
2. Thêm vào **Deploy Command**:
```bash
npm install && node scripts/apply-migration-postgres.js && npm start
```

---

## 🗑️ Cách 3: Reset Database Hoàn Toàn

### ⚠️ CẨN THẬN: Sẽ xóa TẤT CẢ dữ liệu!

### Bước 1: Vào Render Shell

1. Vào PostgreSQL Database service
2. Click **"Connect"** hoặc **"Shell"**

### Bước 2: Xóa Tất Cả Tables

```sql
-- Xóa tất cả tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### Bước 3: Tạo Lại Schema

**Option A: Dùng Sequelize Sync**

Backend sẽ tự động tạo lại tables khi start (nếu `sequelize.sync()` được gọi).

**Option B: Chạy Schema SQL**

Nếu có file `schema.sql` cho PostgreSQL, chạy:
```sql
\i /path/to/schema.sql
```

---

## 📊 Kiểm Tra Database

### Xem Tất Cả Tables:

```sql
\dt
```

### Xem Cấu Trúc Bảng:

```sql
-- Xem cấu trúc bảng stores
\d stores

-- Xem cấu trúc bảng orders
\d orders
```

### Xem Dữ Liệu:

```sql
-- Xem tất cả stores
SELECT * FROM stores;

-- Xem tất cả orders
SELECT * FROM orders LIMIT 10;
```

### Đếm Số Cột:

```sql
-- Đếm số cột trong bảng stores
SELECT COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'stores';

-- Xem tên các cột
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stores';
```

---

## 🔍 Troubleshooting

### Lỗi: "Column already exists"

**Giải pháp:**
- Dùng `ADD COLUMN IF NOT EXISTS` (PostgreSQL 9.5+)
- Hoặc kiểm tra trước khi thêm:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'stores' AND column_name = 'storeGoogleMapLink';
```

### Lỗi: "Cannot drop NOT NULL constraint"

**Giải pháp:**
- Cập nhật dữ liệu NULL trước:
```sql
UPDATE orders 
SET customerName = NULL 
WHERE customerName = '';

ALTER TABLE orders 
ALTER COLUMN customerName DROP NOT NULL;
```

### Lỗi: "Permission denied"

**Giải pháp:**
- Đảm bảo dùng đúng user có quyền
- Kiểm tra database connection string

### Lỗi: "Table does not exist"

**Giải pháp:**
- Chạy schema.sql trước
- Hoặc để Sequelize tự động tạo tables

---

## 📝 Checklist

### Trước Khi Reset:
- [ ] Backup database (nếu có dữ liệu quan trọng)
- [ ] Ghi lại các thay đổi cần thiết
- [ ] Thông báo team (nếu có)

### Khi Reset:
- [ ] Vào Render Shell
- [ ] Chạy DROP SCHEMA
- [ ] Tạo lại schema
- [ ] Chạy migrations (nếu có)
- [ ] Test database connection

### Sau Khi Reset:
- [ ] Kiểm tra tables đã được tạo
- [ ] Kiểm tra cột đã đúng chưa
- [ ] Test API endpoints
- [ ] Test đăng ký/đăng nhập

---

## 🎯 Best Practices

1. **Luôn Backup Trước Khi Reset**
   ```sql
   -- Export data
   pg_dump $DATABASE_URL > backup.sql
   ```

2. **Dùng Migrations Thay Vì Reset**
   - Chỉ reset khi thực sự cần
   - Dùng migrations để thêm/sửa cột

3. **Test Trên Local Trước**
   - Test migrations trên local database trước
   - Đảm bảo SQL syntax đúng

4. **Document Changes**
   - Ghi lại mọi thay đổi database
   - Tạo migration files có version

---

## 💡 Quick Reference

### Thêm Cột:
```sql
ALTER TABLE table_name 
ADD COLUMN IF NOT EXISTS column_name TYPE NULL;
```

### Sửa Cột:
```sql
ALTER TABLE table_name 
ALTER COLUMN column_name TYPE new_type;
```

### Xóa Cột:
```sql
ALTER TABLE table_name 
DROP COLUMN IF EXISTS column_name;
```

### Cho Phép NULL:
```sql
ALTER TABLE table_name 
ALTER COLUMN column_name DROP NOT NULL;
```

### Bắt Buộc NOT NULL:
```sql
ALTER TABLE table_name 
ALTER COLUMN column_name SET NOT NULL;
```

---

## 🎉 Kết Quả

Sau khi reset/cập nhật:
- ✅ Database có cấu trúc mới
- ✅ Các cột đã được thêm/sửa
- ✅ Dữ liệu được giữ lại (nếu không reset)
- ✅ App hoạt động với schema mới

---

**Chúc bạn reset/cập nhật database thành công! 🗄️**


