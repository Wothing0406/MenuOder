# 🚀 Hướng Dẫn Nhanh Migration Database

## Bước 1: Backup Database Cũ (BẮT BUỘC!)

```bash
# MySQL
mysqldump -u [username] -p [database_name] > backup.sql

# PostgreSQL  
pg_dump [connection_string] > backup.sql
```

## Bước 2: Tạo Schema Trên Database Mới

**Cách nhanh nhất:** Tạm thời cập nhật `.env` để trỏ đến database mới, sau đó chạy server:

```bash
# 1. Backup file .env hiện tại
cp backend/src/.env backend/src/.env.backup

# 2. Tạm thời cập nhật DATABASE_URL trong .env
DATABASE_URL=postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a/menu_order_db_wfa4

# 3. Chạy server để sync schema
cd backend
npm start
# Đợi đến khi thấy "Database synchronized successfully" rồi dừng (Ctrl+C)

# 4. Khôi phục .env cũ
cp backend/src/.env.backup backend/src/.env
```

## Bước 3: Chạy Migration

```bash
cd backend

# Đảm bảo .env vẫn trỏ đến database cũ
# Script sẽ tự động dùng connection string mới từ biến môi trường hoặc mặc định

# Chạy migration
npm run migrate-db
# hoặc
node scripts/migrate-database.js
```

## Bước 4: Kiểm Tra Dữ Liệu

Kết nối với database mới và kiểm tra:
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM stores;
SELECT COUNT(*) FROM items;
```

## Bước 5: Cập Nhật Cấu Hình

Sau khi xác nhận dữ liệu đã được copy đầy đủ:

1. Cập nhật `backend/src/.env`:
```env
DATABASE_URL=postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a/menu_order_db_wfa4
NODE_ENV=production
```

2. Test lại ứng dụng:
```bash
npm start
```

## ⚠️ Lưu Ý

- **KHÔNG XÓA** database cũ ngay lập tức
- Giữ backup ít nhất 1-2 tuần
- Test kỹ ứng dụng trước khi chuyển hoàn toàn

## ❓ Gặp Vấn Đề?

Xem file `MIGRATION_GUIDE.md` để có hướng dẫn chi tiết hơn.



