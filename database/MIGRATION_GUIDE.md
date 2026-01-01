# Hướng dẫn Migration Database

## 📋 Tổng quan

Hệ thống có script tự động chạy tất cả các migration theo thứ tự đúng. Script này hỗ trợ cả MySQL và PostgreSQL.

## 🚀 Cách chạy migration

### Cách 1: Sử dụng npm script (Khuyến nghị)

```bash
cd backend
npm run migrate:all
```

Hoặc chạy với seed data:

```bash
npm run migrate:all -- --seed
```

### Cách 2: Chạy trực tiếp script

```bash
cd backend
node scripts/run-all-migrations.js
```

Hoặc với seed:

```bash
node scripts/run-all-migrations.js --seed
```

## ⚙️ Cấu hình

### MySQL

Đảm bảo file `.env` có các biến sau:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=menu_order_db
```

Hoặc có thể dùng `DB_TYPE=mysql`:

```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=menu_order_db
```

### PostgreSQL

Đảm bảo file `.env` có:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/menu_order_db
```

Hoặc:

```env
DB_TYPE=postgres
DATABASE_URL=postgresql://user:password@localhost:5432/menu_order_db
```

## 📝 Danh sách Migration

### MySQL Migrations (theo thứ tự)

1. `migration_add_new_features.sql` - Các tính năng cơ bản
2. `migration_fix_customer_fields.sql` - Sửa trường khách hàng
3. `migration_add_detailed_address.sql` - Thêm địa chỉ chi tiết
4. `migration_add_vouchers.sql` - Thêm bảng vouchers
5. `migration_fix_voucher_storeId_nullable.sql` - Sửa voucher storeId
6. `migration_add_completed_status.sql` - Thêm trạng thái completed
7. `migration_add_storeGoogleMapLink.sql` - Thêm Google Map link
8. `migration_fix_item_deletion.sql` - Sửa xóa item
9. `migration_add_reviews.sql` - Thêm bảng reviews
10. `migration_add_zalopay.sql` - Thêm ZaloPay
11. `migration_add_bank_transfer.sql` - Thêm Bank Transfer
12. `migration_add_bank_transfer_qr_code_to_orders.sql` - Thêm QR code vào orders
13. `migration_add_payment_accounts.sql` - Thêm bảng payment_accounts
14. `migration_add_payment_account_to_orders.sql` - Thêm paymentAccountId vào orders
15. `migration_verify_payment_accounts.sql` - Kiểm tra và thêm cột thiếu

### PostgreSQL Migrations (theo thứ tự)

1. `migration_add_new_features_postgresql.sql` - Các tính năng cơ bản
2. `migration_add_completed_status_postgresql.sql` - Thêm trạng thái completed
3. `migration_fix_item_deletion_postgresql.sql` - Sửa xóa item
4. `migration_add_reviews_postgresql.sql` - Thêm bảng reviews
5. `migration_add_payment_accounts_postgresql.sql` - Thêm bảng payment_accounts
6. `migration_add_payment_account_to_orders_postgresql.sql` - Thêm paymentAccountId vào orders
7. `migration_verify_payment_accounts_postgresql.sql` - Kiểm tra và thêm cột thiếu

## 🔍 Kiểm tra Migration

### Xem log khi chạy

Script sẽ hiển thị:
- ✅ `Done [filename]` - Migration thành công
- ℹ️ `Skipped (already applied)` - Migration đã được chạy trước đó
- ❌ Error message - Có lỗi xảy ra

### Kiểm tra thủ công

**MySQL:**
```sql
USE menu_order_db;
SHOW TABLES;
DESCRIBE payment_accounts;
DESCRIBE orders; -- Kiểm tra cột paymentAccountId
```

**PostgreSQL:**
```sql
\dt -- Liệt kê tất cả bảng
\d payment_accounts -- Xem cấu trúc bảng
\d orders -- Kiểm tra cột paymentAccountId
```

## 🛠️ Troubleshooting

### Lỗi "Table doesn't exist"

- Đảm bảo database đã được tạo
- Chạy `schema.sql` trước nếu cần

### Lỗi "Column already exists"

- Đây là bình thường nếu migration đã chạy trước đó
- Script sẽ tự động bỏ qua (idempotent)

### Lỗi "Foreign key constraint fails"

- Kiểm tra xem các bảng liên quan đã tồn tại chưa
- Đảm bảo chạy migration theo đúng thứ tự

### Lỗi kết nối database

- Kiểm tra thông tin kết nối trong `.env`
- Đảm bảo database server đang chạy
- Kiểm tra quyền truy cập của user

## 📦 Seed Data

Để chạy migration kèm seed data:

```bash
npm run migrate:all -- --seed
```

Hoặc set biến môi trường:

```env
RUN_SEED=true
npm run migrate:all
```

## ⚠️ Lưu ý

1. **Backup trước khi chạy** - Luôn backup database trước khi chạy migration trong production
2. **Thứ tự quan trọng** - Không thay đổi thứ tự trong danh sách migration
3. **Idempotent** - Tất cả migration đều idempotent, có thể chạy nhiều lần an toàn
4. **Test trước** - Test migration trên môi trường dev trước khi chạy production

## 🔄 Reset Database

Nếu muốn reset hoàn toàn:

```bash
cd backend
npm run reset-db
```

**⚠️ Cảnh báo:** Lệnh này sẽ xóa TẤT CẢ dữ liệu!

## 📚 Tài liệu liên quan

- `README_PAYMENT_ACCOUNTS.md` - Chi tiết về payment accounts migration
- `MIGRATION_COMMANDS.md` - Các lệnh migration cơ bản
- `BANK_ACCOUNT_VERIFICATION.md` - Hướng dẫn xác thực tài khoản ngân hàng



## 📋 Tổng quan

Hệ thống có script tự động chạy tất cả các migration theo thứ tự đúng. Script này hỗ trợ cả MySQL và PostgreSQL.

## 🚀 Cách chạy migration

### Cách 1: Sử dụng npm script (Khuyến nghị)

```bash
cd backend
npm run migrate:all
```

Hoặc chạy với seed data:

```bash
npm run migrate:all -- --seed
```

### Cách 2: Chạy trực tiếp script

```bash
cd backend
node scripts/run-all-migrations.js
```

Hoặc với seed:

```bash
node scripts/run-all-migrations.js --seed
```

## ⚙️ Cấu hình

### MySQL

Đảm bảo file `.env` có các biến sau:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=menu_order_db
```

Hoặc có thể dùng `DB_TYPE=mysql`:

```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=menu_order_db
```

### PostgreSQL

Đảm bảo file `.env` có:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/menu_order_db
```

Hoặc:

```env
DB_TYPE=postgres
DATABASE_URL=postgresql://user:password@localhost:5432/menu_order_db
```

## 📝 Danh sách Migration

### MySQL Migrations (theo thứ tự)

1. `migration_add_new_features.sql` - Các tính năng cơ bản
2. `migration_fix_customer_fields.sql` - Sửa trường khách hàng
3. `migration_add_detailed_address.sql` - Thêm địa chỉ chi tiết
4. `migration_add_vouchers.sql` - Thêm bảng vouchers
5. `migration_fix_voucher_storeId_nullable.sql` - Sửa voucher storeId
6. `migration_add_completed_status.sql` - Thêm trạng thái completed
7. `migration_add_storeGoogleMapLink.sql` - Thêm Google Map link
8. `migration_fix_item_deletion.sql` - Sửa xóa item
9. `migration_add_reviews.sql` - Thêm bảng reviews
10. `migration_add_zalopay.sql` - Thêm ZaloPay
11. `migration_add_bank_transfer.sql` - Thêm Bank Transfer
12. `migration_add_bank_transfer_qr_code_to_orders.sql` - Thêm QR code vào orders
13. `migration_add_payment_accounts.sql` - Thêm bảng payment_accounts
14. `migration_add_payment_account_to_orders.sql` - Thêm paymentAccountId vào orders
15. `migration_verify_payment_accounts.sql` - Kiểm tra và thêm cột thiếu

### PostgreSQL Migrations (theo thứ tự)

1. `migration_add_new_features_postgresql.sql` - Các tính năng cơ bản
2. `migration_add_completed_status_postgresql.sql` - Thêm trạng thái completed
3. `migration_fix_item_deletion_postgresql.sql` - Sửa xóa item
4. `migration_add_reviews_postgresql.sql` - Thêm bảng reviews
5. `migration_add_payment_accounts_postgresql.sql` - Thêm bảng payment_accounts
6. `migration_add_payment_account_to_orders_postgresql.sql` - Thêm paymentAccountId vào orders
7. `migration_verify_payment_accounts_postgresql.sql` - Kiểm tra và thêm cột thiếu

## 🔍 Kiểm tra Migration

### Xem log khi chạy

Script sẽ hiển thị:
- ✅ `Done [filename]` - Migration thành công
- ℹ️ `Skipped (already applied)` - Migration đã được chạy trước đó
- ❌ Error message - Có lỗi xảy ra

### Kiểm tra thủ công

**MySQL:**
```sql
USE menu_order_db;
SHOW TABLES;
DESCRIBE payment_accounts;
DESCRIBE orders; -- Kiểm tra cột paymentAccountId
```

**PostgreSQL:**
```sql
\dt -- Liệt kê tất cả bảng
\d payment_accounts -- Xem cấu trúc bảng
\d orders -- Kiểm tra cột paymentAccountId
```

## 🛠️ Troubleshooting

### Lỗi "Table doesn't exist"

- Đảm bảo database đã được tạo
- Chạy `schema.sql` trước nếu cần

### Lỗi "Column already exists"

- Đây là bình thường nếu migration đã chạy trước đó
- Script sẽ tự động bỏ qua (idempotent)

### Lỗi "Foreign key constraint fails"

- Kiểm tra xem các bảng liên quan đã tồn tại chưa
- Đảm bảo chạy migration theo đúng thứ tự

### Lỗi kết nối database

- Kiểm tra thông tin kết nối trong `.env`
- Đảm bảo database server đang chạy
- Kiểm tra quyền truy cập của user

## 📦 Seed Data

Để chạy migration kèm seed data:

```bash
npm run migrate:all -- --seed
```

Hoặc set biến môi trường:

```env
RUN_SEED=true
npm run migrate:all
```

## ⚠️ Lưu ý

1. **Backup trước khi chạy** - Luôn backup database trước khi chạy migration trong production
2. **Thứ tự quan trọng** - Không thay đổi thứ tự trong danh sách migration
3. **Idempotent** - Tất cả migration đều idempotent, có thể chạy nhiều lần an toàn
4. **Test trước** - Test migration trên môi trường dev trước khi chạy production

## 🔄 Reset Database

Nếu muốn reset hoàn toàn:

```bash
cd backend
npm run reset-db
```

**⚠️ Cảnh báo:** Lệnh này sẽ xóa TẤT CẢ dữ liệu!

## 📚 Tài liệu liên quan

- `README_PAYMENT_ACCOUNTS.md` - Chi tiết về payment accounts migration
- `MIGRATION_COMMANDS.md` - Các lệnh migration cơ bản
- `BANK_ACCOUNT_VERIFICATION.md` - Hướng dẫn xác thực tài khoản ngân hàng






























