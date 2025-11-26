# 🐚 Hướng Dẫn Vào Shell và Xóa Dữ Liệu Trên Render

## 📋 Cách Vào Shell

### Bước 1: Vào Database Dashboard
1. Bạn đang ở trang **Info** của database `menu_order_db` ✅
2. Ở sidebar bên trái, tìm phần **"MANAGE"**
3. Click vào **"Shell"** (nếu có) hoặc **"Connect"**

### Bước 2: Hoặc Dùng Connect Button
1. Ở trang **Info**, tìm button **"Connect"** (bên cạnh "View docs")
2. Click **"Connect"**
3. Render sẽ hiển thị connection string hoặc mở shell

### Bước 3: Nếu Không Có Shell Trực Tiếp
Render PostgreSQL không có shell trực tiếp. Bạn cần:

**Option A: Dùng Backend Service Shell**
1. Vào **Backend Service** (không phải Database)
2. Click tab **"Shell"**
3. Chạy lệnh:
   ```bash
   psql $DATABASE_URL
   ```

**Option B: Dùng Local psql**
1. Copy connection string từ Render
2. Dùng psql trên máy local:
   ```bash
   psql "postgresql://user:password@host:port/database"
   ```

---

## 🗑️ Xóa Dữ Liệu

### ⚠️ CẨN THẬN: Các lệnh này sẽ XÓA DỮ LIỆU!

### 1. Xóa Tất Cả Dữ Liệu (Giữ Lại Tables)

```sql
-- Xóa tất cả dữ liệu trong tất cả tables
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE stores CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE items CASCADE;
TRUNCATE TABLE item_options CASCADE;
TRUNCATE TABLE item_accompaniments CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE order_items CASCADE;
```

Hoặc xóa từng bảng một:

```sql
-- Xóa dữ liệu trong bảng orders (có foreign keys)
DELETE FROM order_items;
DELETE FROM orders;

-- Xóa dữ liệu trong bảng items
DELETE FROM item_accompaniments;
DELETE FROM item_options;
DELETE FROM items;

-- Xóa dữ liệu trong bảng categories
DELETE FROM categories;

-- Xóa dữ liệu trong bảng stores
DELETE FROM stores;

-- Xóa dữ liệu trong bảng users
DELETE FROM users;
```

### 2. Xóa Dữ Liệu Cụ Thể

#### Xóa Tất Cả Orders:
```sql
DELETE FROM order_items;
DELETE FROM orders;
```

#### Xóa Tất Cả Items:
```sql
DELETE FROM item_accompaniments;
DELETE FROM item_options;
DELETE FROM items;
```

#### Xóa Tất Cả Categories:
```sql
DELETE FROM categories;
```

#### Xóa Tất Cả Stores:
```sql
DELETE FROM stores;
```

#### Xóa Tất Cả Users:
```sql
DELETE FROM users;
```

### 3. Xóa Dữ Liệu Theo Điều Kiện

#### Xóa Orders Cũ Hơn 30 Ngày:
```sql
DELETE FROM order_items 
WHERE order_id IN (
  SELECT id FROM orders 
  WHERE created_at < NOW() - INTERVAL '30 days'
);

DELETE FROM orders 
WHERE created_at < NOW() - INTERVAL '30 days';
```

#### Xóa Orders Của Một Store Cụ Thể:
```sql
DELETE FROM order_items 
WHERE order_id IN (
  SELECT id FROM orders 
  WHERE store_id = 1
);

DELETE FROM orders 
WHERE store_id = 1;
```

#### Xóa User Cụ Thể:
```sql
DELETE FROM users 
WHERE id = 1;
```

### 4. Reset Hoàn Toàn (Xóa Tất Cả Tables và Dữ Liệu)

```sql
-- Xóa TẤT CẢ (tables + data)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

**Sau khi chạy lệnh này:**
- Backend sẽ tự động tạo lại tables khi restart (nếu có `sequelize.sync()`)
- Hoặc chạy lại schema.sql

---

## 🔍 Kiểm Tra Dữ Liệu Trước Khi Xóa

### Xem Số Lượng Records:

```sql
-- Đếm số records trong mỗi bảng
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'stores', COUNT(*) FROM stores
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'items', COUNT(*) FROM items
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items;
```

### Xem Dữ Liệu:

```sql
-- Xem tất cả users
SELECT * FROM users;

-- Xem tất cả stores
SELECT * FROM stores;

-- Xem tất cả orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
```

---

## 📝 Hướng Dẫn Chi Tiết Từng Bước

### Cách 1: Dùng Backend Service Shell (Khuyến Nghị)

1. **Vào Backend Service**
   - Từ sidebar, chọn **Backend Service** (không phải Database)
   - Hoặc vào: https://dashboard.render.com → Chọn Backend service

2. **Vào Shell**
   - Click tab **"Shell"** ở trên cùng
   - Hoặc vào **"Connect"** → **"Shell"**

3. **Kết Nối Database**
   ```bash
   psql $DATABASE_URL
   ```

4. **Chạy SQL Commands**
   ```sql
   -- Ví dụ: Xóa tất cả orders
   DELETE FROM order_items;
   DELETE FROM orders;
   ```

5. **Thoát**
   ```sql
   \q
   ```

### Cách 2: Dùng Render Dashboard (Nếu Có)

1. **Vào Database Dashboard**
   - Bạn đang ở đây rồi ✅

2. **Tìm Shell/Connect**
   - Click button **"Connect"** ở trang Info
   - Hoặc tìm tab **"Shell"** trong sidebar

3. **Nếu Không Có Shell**
   - Phải dùng Backend Service Shell (Cách 1)

---

## 🎯 Quick Commands

### Xóa Tất Cả Dữ Liệu (Giữ Tables):
```sql
TRUNCATE TABLE order_items, orders, items, item_options, item_accompaniments, categories, stores, users CASCADE;
```

### Xóa Chỉ Orders:
```sql
DELETE FROM order_items;
DELETE FROM orders;
```

### Reset Hoàn Toàn:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Backup Trước Khi Xóa**
   - Export data nếu cần:
   ```bash
   pg_dump $DATABASE_URL > backup.sql
   ```

2. **Foreign Keys**
   - Xóa theo thứ tự: child tables trước, parent tables sau
   - Hoặc dùng `CASCADE` để tự động xóa

3. **Không Thể Hoàn Tác**
   - `DELETE` và `DROP` không thể undo
   - Chắc chắn trước khi chạy

4. **Test Trên Local Trước**
   - Test các lệnh trên local database trước
   - Đảm bảo không xóa nhầm

---

## 🐛 Troubleshooting

### Lỗi: "Cannot delete because of foreign key"

**Giải pháp:**
- Xóa child records trước:
```sql
DELETE FROM order_items;
DELETE FROM orders;
```

Hoặc dùng CASCADE:
```sql
DELETE FROM orders CASCADE;
```

### Lỗi: "Permission denied"

**Giải pháp:**
- Đảm bảo dùng đúng user có quyền
- Kiểm tra connection string

### Lỗi: "Table does not exist"

**Giải pháp:**
- Kiểm tra tên bảng có đúng không
- Xem danh sách tables: `\dt`

---

## 📋 Checklist

- [ ] Đã backup database (nếu cần)
- [ ] Đã vào Shell thành công
- [ ] Đã kiểm tra dữ liệu trước khi xóa
- [ ] Đã chạy lệnh xóa
- [ ] Đã kiểm tra kết quả
- [ ] Database đã được reset/xóa đúng

---

## 🎉 Kết Quả

Sau khi xóa:
- ✅ Dữ liệu đã được xóa
- ✅ Tables vẫn còn (nếu dùng DELETE/TRUNCATE)
- ✅ Có thể thêm dữ liệu mới
- ✅ Database sạch sẽ

---

**Chúc bạn xóa dữ liệu thành công! 🗑️**


