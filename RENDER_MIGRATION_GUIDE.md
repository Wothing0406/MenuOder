# 🔄 Hướng Dẫn Migration Database Trên Render

Khi bạn upload code mới lên Render, **database schema sẽ được tự động cập nhật** thông qua Sequelize sync, nhưng **migration SQL cần được chạy thủ công hoặc thêm vào build process**.

## 📊 Cách Hoạt Động

### ✅ Tự Động (Sequelize Sync)
- **Sequelize sync** sẽ tự động:
  - Tạo bảng mới nếu chưa có
  - Thêm cột mới nếu thiếu (với `alter: true` trên Render)
  - **KHÔNG** xóa dữ liệu
  - **KHÔNG** chạy migration SQL files

### ⚠️ Cần Thủ Công (SQL Migrations)
- Các file migration SQL (như `migration_fix_voucher_storeId_nullable.sql`) cần được chạy thủ công
- Hoặc thêm vào build command để tự động chạy

## 🚀 Cách 1: Thêm Migration Vào Build Command (Khuyến Nghị)

### Bước 1: Vào Render Dashboard
1. Vào **Render Dashboard** → **Services** → Chọn service backend của bạn
2. Vào tab **Settings**

### Bước 2: Cập Nhật Build Command
Tìm phần **Build Command** và thay đổi thành:

```bash
cd backend && npm install && npm run apply-migration && npm run build
```

Hoặc nếu không có build step:

```bash
cd backend && npm install && npm run apply-migration
```

### Bước 3: Kiểm Tra Start Command
Đảm bảo **Start Command** là:

```bash
cd backend && npm start
```

### Bước 4: Save và Deploy
1. Click **Save Changes**
2. Render sẽ tự động deploy lại
3. Migration sẽ được chạy mỗi lần deploy

## 🔧 Cách 2: Chạy Migration Thủ Công (Một Lần)

Nếu bạn chỉ cần chạy migration một lần:

### Bước 1: Kết Nối Đến Database
1. Vào **Render Dashboard** → **Databases** → Chọn database của bạn
2. Copy **Internal Database URL** hoặc **External Connection String**

### Bước 2: Chạy Migration Từ Local
1. Tạm thời cập nhật `.env` trong `backend/` để trỏ đến database trên Render:

```env
DB_HOST=your-render-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
```

2. Chạy migration:

```bash
cd backend
npm run apply-migration
```

### Bước 3: Hoặc Chạy SQL Trực Tiếp
1. Vào **Render Dashboard** → **Databases** → Chọn database
2. Click **Connect** → **psql** (hoặc MySQL client)
3. Copy nội dung file `database/migration_fix_voucher_storeId_nullable.sql`
4. Paste và chạy trong database console

## 📝 Migration Hiện Tại Cần Chạy

### Migration: `migration_fix_voucher_storeId_nullable.sql`
**Mục đích:** Cho phép `storeId` trong bảng `vouchers` có giá trị NULL (để tạo voucher toàn hệ thống)

**Nội dung:**
```sql
ALTER TABLE vouchers 
MODIFY COLUMN storeId INT NULL;
```

## ✅ Kiểm Tra Migration Đã Chạy

### Cách 1: Kiểm Tra Logs
1. Vào **Render Dashboard** → **Services** → Chọn service backend
2. Vào tab **Logs**
3. Tìm dòng:
   ```
   ✅ Migration fix_voucher_storeId_nullable applied
   ```

### Cách 2: Kiểm Tra Database
Kết nối đến database và chạy:

```sql
-- MySQL
SHOW CREATE TABLE vouchers;

-- PostgreSQL  
\d vouchers
```

Kiểm tra xem cột `storeId` có `NULL` hay không.

### Cách 3: Test Tạo Voucher
1. Vào trang admin
2. Thử tạo voucher toàn hệ thống
3. Nếu không còn lỗi "storeId cannot be null" → Migration đã thành công

## 🔄 Khi Nào Cần Chạy Migration?

Migration cần được chạy khi:
- ✅ Có thay đổi cấu trúc database (thêm/sửa/xóa cột)
- ✅ Có file migration SQL mới
- ✅ Cần sửa constraint hoặc index

**KHÔNG cần chạy migration khi:**
- ❌ Chỉ thay đổi code logic (không ảnh hưởng database)
- ❌ Chỉ thay đổi frontend
- ❌ Sequelize sync đã tự động thêm cột mới

## 🎯 Tóm Tắt

**Để đảm bảo migration được chạy khi deploy:**

1. ✅ **Thêm vào Build Command** (Cách 1 - Khuyến nghị)
   ```
   cd backend && npm install && npm run apply-migration
   ```

2. ✅ **Hoặc chạy thủ công** sau khi deploy (Cách 2)

3. ✅ **Kiểm tra logs** để đảm bảo migration đã chạy

4. ✅ **Test tính năng** để xác nhận migration thành công

---

**Lưu ý:** 
- Sequelize sync (`alter: true`) sẽ tự động thêm cột mới, nhưng không thể sửa constraint (như `allowNull`)
- Migration SQL cần thiết cho các thay đổi constraint, index, hoặc foreign key
- Luôn backup database trước khi chạy migration trên production

