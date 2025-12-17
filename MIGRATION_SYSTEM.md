# 🚀 Hệ Thống Migration Tự Động

## Tổng Quan

Hệ thống migration tự động gộp tất cả các file migration thành một hệ thống thống nhất, tự động chạy khi deploy lên Render mà **không mất dữ liệu cũ**.

## ✨ Tính Năng

- ✅ **Tự động detect database** (PostgreSQL/MySQL)
- ✅ **Chạy tất cả migrations theo thứ tự** đúng
- ✅ **Idempotent** - có thể chạy nhiều lần an toàn
- ✅ **Không mất dữ liệu** - chỉ thêm cột/bảng, không xóa
- ✅ **Tự động skip** nếu migration đã được apply
- ✅ **Tự động chạy khi deploy** lên Render

## 📋 Cách Sử Dụng

### 1. Chạy Migration Thủ Công

```bash
cd backend
npm run migrate
# hoặc
node scripts/unified-migration.js
```

### 2. Tự Động Chạy Khi Deploy

Hệ thống sẽ tự động chạy khi:
- `AUTO_MIGRATE=true` (hoặc không set, mặc định là true)
- `NODE_ENV=production`
- Server start trên Render

### 3. Kiểm Tra Migration Status

```bash
cd backend
npm run check:schema
```

## 🔧 Cấu Hình

### Environment Variables trên Render

```env
DATABASE_URL=postgresql://...  # PostgreSQL connection string
# hoặc
DB_HOST=...                    # MySQL
DB_USER=...
DB_PASSWORD=...
DB_NAME=...

AUTO_MIGRATE=true             # Tự động chạy migration (mặc định: true)
NODE_ENV=production
```

## 📁 Cấu Trúc Migration Files

Tất cả migration files nằm trong thư mục `database/`:

```
database/
├── migration_add_new_features_postgresql.sql
├── migration_add_new_features.sql
├── migration_add_completed_status_postgresql.sql
├── migration_add_completed_status.sql
├── migration_fix_customer_fields.sql
├── migration_add_detailed_address.sql
├── migration_add_storeGoogleMapLink.sql
├── migration_add_vouchers.sql
├── migration_fix_voucher_storeId_nullable.sql
├── migration_fix_item_deletion_postgresql.sql
├── migration_fix_item_deletion.sql
├── migration_add_reviews_postgresql.sql
├── migration_add_reviews.sql
├── migration_add_zalopay.sql
├── migration_add_bank_transfer.sql
├── migration_add_bank_transfer_qr_code_to_orders.sql
├── migration_add_payment_accounts_postgresql.sql
├── migration_add_payment_accounts.sql
├── migration_add_payment_account_to_orders_postgresql.sql
├── migration_add_payment_account_to_orders.sql
├── migration_verify_payment_accounts_postgresql.sql
└── migration_verify_payment_accounts.sql
```

## 🔄 Thứ Tự Chạy Migration

Hệ thống sẽ chạy migrations theo thứ tự sau:

1. **Core migrations** - Các migration cơ bản
2. **Status và fields** - Thêm trạng thái và các trường mới
3. **Address và location** - Địa chỉ và vị trí
4. **Vouchers** - Mã giảm giá
5. **Items** - Sửa lỗi xóa món
6. **Reviews** - Đánh giá
7. **Payment methods** - Phương thức thanh toán
8. **Payment accounts** - Tài khoản thanh toán

## 🛡️ An Toàn Dữ Liệu

- ✅ **Chỉ thêm** - Không xóa cột/bảng
- ✅ **Idempotent** - Có thể chạy nhiều lần
- ✅ **Skip nếu đã có** - Tự động bỏ qua nếu column/table đã tồn tại
- ✅ **Không mất dữ liệu** - Không có DROP hoặc DELETE

## 🐛 Troubleshooting

### Lỗi: "Column already exists"

Đây là lỗi **không nghiêm trọng** - hệ thống sẽ tự động skip migration này.

### Lỗi: "Table does not exist"

Đảm bảo các migration cơ bản đã chạy trước. Migration system sẽ tự động chạy theo thứ tự.

### Lỗi: "Connection refused"

Kiểm tra:
- `DATABASE_URL` có đúng không
- Database có đang chạy không
- Network có accessible không

### Migration không chạy tự động

Kiểm tra:
- `AUTO_MIGRATE=true` đã được set chưa
- `NODE_ENV=production` đã được set chưa
- Xem logs trên Render để biết lý do

## 📝 Thêm Migration Mới

1. Tạo file SQL trong `database/`:
   ```sql
   -- migration_add_new_feature.sql
   ALTER TABLE orders ADD COLUMN new_column VARCHAR(255);
   ```

2. Thêm vào danh sách trong `backend/scripts/unified-migration.js`:
   ```javascript
   const MIGRATION_FILES = [
     // ... existing migrations
     'migration_add_new_feature.sql'
   ];
   ```

3. Đảm bảo migration là **idempotent**:
   ```sql
   -- Good: Check before adding
   DO $$ 
   BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM information_schema.columns 
       WHERE table_name = 'orders' AND column_name = 'new_column'
     ) THEN
       ALTER TABLE orders ADD COLUMN new_column VARCHAR(255);
     END IF;
   END $$;
   ```

## 🔍 Kiểm Tra Logs

Trên Render, xem logs để biết migration status:

```
🔌 Connecting to database...
✅ Connected to POSTGRES database

📦 Found 15 migration(s) to apply

🛠  Applying: migration_add_new_features_postgresql.sql...
   ✅ Applied: migration_add_new_features_postgresql.sql
🛠  Applying: migration_add_completed_status_postgresql.sql...
   ⏭️  Skipped (already applied): migration_add_completed_status_postgresql.sql

📊 Migration Summary:
   ✅ Success: 12
   ⏭️  Skipped: 3

✨ Migration process completed!
```

## ✅ Checklist Deploy

Trước khi deploy:

- [ ] Tất cả migration files đã được commit
- [ ] `DATABASE_URL` đã được set trên Render
- [ ] `AUTO_MIGRATE=true` (hoặc không set, mặc định true)
- [ ] `NODE_ENV=production`
- [ ] Đã test migration local (nếu có thể)

Sau khi deploy:

- [ ] Kiểm tra logs trên Render
- [ ] Tìm dòng "✨ Migration process completed!"
- [ ] Kiểm tra database schema đã đúng chưa
- [ ] Test API để đảm bảo không có lỗi

## 📚 Tài Liệu Liên Quan

- `backend/scripts/unified-migration.js` - Script migration chính
- `backend/scripts/deploy-migrations.js` - Wrapper cho auto-migration
- `database/` - Thư mục chứa tất cả migration files




