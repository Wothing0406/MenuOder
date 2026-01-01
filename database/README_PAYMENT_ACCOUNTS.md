# Migration Payment Accounts - Hướng dẫn

## Tổng quan

Các migration này thêm tính năng quản lý nhiều tài khoản thanh toán cho mỗi cửa hàng, bao gồm:
- Tài khoản ngân hàng (bank transfer)
- Tài khoản ZaloPay

## Các file migration

### MySQL

1. **migration_add_payment_accounts.sql**
   - Tạo bảng `payment_accounts`
   - Thêm các cột: isActive, isVerified, verifiedAt, verificationError
   - Tạo indexes và foreign keys

2. **migration_add_payment_account_to_orders.sql**
   - Thêm cột `paymentAccountId` vào bảng `orders`
   - Tạo foreign key constraint

3. **migration_verify_payment_accounts.sql**
   - Kiểm tra và thêm các cột nếu thiếu (idempotent)
   - Đảm bảo tất cả indexes đã được tạo

### PostgreSQL

1. **migration_add_payment_accounts_postgresql.sql**
   - Tạo bảng `payment_accounts` cho PostgreSQL
   - Sử dụng SERIAL cho auto-increment
   - Sử dụng CHECK constraint thay vì ENUM

2. **migration_add_payment_account_to_orders_postgresql.sql**
   - Thêm cột `paymentAccountId` vào bảng `orders` (PostgreSQL)
   - Sử dụng DO block để kiểm tra trước khi thêm

3. **migration_verify_payment_accounts_postgresql.sql**
   - Kiểm tra và thêm các cột nếu thiếu (PostgreSQL)
   - Sử dụng DO blocks cho idempotent operations

## Cấu trúc bảng payment_accounts

```sql
- id: Primary key (AUTO_INCREMENT / SERIAL)
- storeId: Foreign key to stores table
- accountType: ENUM('bank_transfer', 'zalopay')
- accountName: Tên hiển thị của tài khoản
- isActive: BOOLEAN - Tài khoản có hiển thị cho khách không
- isDefault: BOOLEAN - Tài khoản mặc định cho loại thanh toán này

-- Bank Transfer fields
- bankAccountNumber: Số tài khoản
- bankAccountName: Tên chủ tài khoản
- bankName: Tên ngân hàng
- bankCode: Mã ngân hàng (BIN)

-- ZaloPay fields
- zaloPayAppId: ZaloPay App ID
- zaloPayKey1: ZaloPay Key 1
- zaloPayKey2: ZaloPay Key 2
- zaloPayMerchantId: Merchant ID

-- Verification status
- isVerified: BOOLEAN - Đã xác thực chưa
- verifiedAt: TIMESTAMP - Thời gian xác thực
- verificationError: TEXT - Lỗi xác thực (nếu có)

- createdAt, updatedAt: Timestamps
```

## Cách chạy migration

### MySQL

```bash
# Chạy migration tạo bảng
mysql -u root -p menu_order_db < database/migration_add_payment_accounts.sql

# Chạy migration thêm cột vào orders
mysql -u root -p menu_order_db < database/migration_add_payment_account_to_orders.sql

# Chạy migration kiểm tra (optional, idempotent)
mysql -u root -p menu_order_db < database/migration_verify_payment_accounts.sql
```

### PostgreSQL

```bash
# Chạy migration tạo bảng
psql -U postgres -d menu_order_db -f database/migration_add_payment_accounts_postgresql.sql

# Chạy migration thêm cột vào orders
psql -U postgres -d menu_order_db -f database/migration_add_payment_account_to_orders_postgresql.sql

# Chạy migration kiểm tra (optional, idempotent)
psql -U postgres -d menu_order_db -f database/migration_verify_payment_accounts_postgresql.sql
```

## Lưu ý

1. **Thứ tự chạy migration:**
   - Chạy `migration_add_payment_accounts.sql` trước
   - Sau đó chạy `migration_add_payment_account_to_orders.sql`
   - Cuối cùng chạy `migration_verify_payment_accounts.sql` (nếu cần)

2. **Idempotent:**
   - Tất cả các migration đều idempotent (có thể chạy nhiều lần an toàn)
   - Chúng sẽ kiểm tra xem cột/constraint đã tồn tại chưa trước khi thêm

3. **Unique constraint:**
   - MySQL: Sử dụng UNIQUE constraint với isDefault
   - PostgreSQL: Unique constraint được xử lý ở application level vì cách xử lý NULL khác nhau

4. **Backup:**
   - Luôn backup database trước khi chạy migration
   - Đặc biệt quan trọng nếu đã có dữ liệu trong production

## Kiểm tra sau migration

```sql
-- MySQL
DESCRIBE payment_accounts;
SHOW INDEX FROM payment_accounts;
DESCRIBE orders; -- Kiểm tra cột paymentAccountId

-- PostgreSQL
\d payment_accounts
\d orders -- Kiểm tra cột paymentAccountId
```

## Troubleshooting

### Lỗi "Column already exists"
- Migration đã được chạy trước đó
- Có thể bỏ qua hoặc chạy migration verify để kiểm tra

### Lỗi "Foreign key constraint fails"
- Đảm bảo bảng `stores` đã tồn tại
- Kiểm tra xem có dữ liệu trong `stores` không

### Lỗi "Table doesn't exist"
- Chạy migration tạo bảng trước
- Kiểm tra tên database có đúng không



## Tổng quan

Các migration này thêm tính năng quản lý nhiều tài khoản thanh toán cho mỗi cửa hàng, bao gồm:
- Tài khoản ngân hàng (bank transfer)
- Tài khoản ZaloPay

## Các file migration

### MySQL

1. **migration_add_payment_accounts.sql**
   - Tạo bảng `payment_accounts`
   - Thêm các cột: isActive, isVerified, verifiedAt, verificationError
   - Tạo indexes và foreign keys

2. **migration_add_payment_account_to_orders.sql**
   - Thêm cột `paymentAccountId` vào bảng `orders`
   - Tạo foreign key constraint

3. **migration_verify_payment_accounts.sql**
   - Kiểm tra và thêm các cột nếu thiếu (idempotent)
   - Đảm bảo tất cả indexes đã được tạo

### PostgreSQL

1. **migration_add_payment_accounts_postgresql.sql**
   - Tạo bảng `payment_accounts` cho PostgreSQL
   - Sử dụng SERIAL cho auto-increment
   - Sử dụng CHECK constraint thay vì ENUM

2. **migration_add_payment_account_to_orders_postgresql.sql**
   - Thêm cột `paymentAccountId` vào bảng `orders` (PostgreSQL)
   - Sử dụng DO block để kiểm tra trước khi thêm

3. **migration_verify_payment_accounts_postgresql.sql**
   - Kiểm tra và thêm các cột nếu thiếu (PostgreSQL)
   - Sử dụng DO blocks cho idempotent operations

## Cấu trúc bảng payment_accounts

```sql
- id: Primary key (AUTO_INCREMENT / SERIAL)
- storeId: Foreign key to stores table
- accountType: ENUM('bank_transfer', 'zalopay')
- accountName: Tên hiển thị của tài khoản
- isActive: BOOLEAN - Tài khoản có hiển thị cho khách không
- isDefault: BOOLEAN - Tài khoản mặc định cho loại thanh toán này

-- Bank Transfer fields
- bankAccountNumber: Số tài khoản
- bankAccountName: Tên chủ tài khoản
- bankName: Tên ngân hàng
- bankCode: Mã ngân hàng (BIN)

-- ZaloPay fields
- zaloPayAppId: ZaloPay App ID
- zaloPayKey1: ZaloPay Key 1
- zaloPayKey2: ZaloPay Key 2
- zaloPayMerchantId: Merchant ID

-- Verification status
- isVerified: BOOLEAN - Đã xác thực chưa
- verifiedAt: TIMESTAMP - Thời gian xác thực
- verificationError: TEXT - Lỗi xác thực (nếu có)

- createdAt, updatedAt: Timestamps
```

## Cách chạy migration

### MySQL

```bash
# Chạy migration tạo bảng
mysql -u root -p menu_order_db < database/migration_add_payment_accounts.sql

# Chạy migration thêm cột vào orders
mysql -u root -p menu_order_db < database/migration_add_payment_account_to_orders.sql

# Chạy migration kiểm tra (optional, idempotent)
mysql -u root -p menu_order_db < database/migration_verify_payment_accounts.sql
```

### PostgreSQL

```bash
# Chạy migration tạo bảng
psql -U postgres -d menu_order_db -f database/migration_add_payment_accounts_postgresql.sql

# Chạy migration thêm cột vào orders
psql -U postgres -d menu_order_db -f database/migration_add_payment_account_to_orders_postgresql.sql

# Chạy migration kiểm tra (optional, idempotent)
psql -U postgres -d menu_order_db -f database/migration_verify_payment_accounts_postgresql.sql
```

## Lưu ý

1. **Thứ tự chạy migration:**
   - Chạy `migration_add_payment_accounts.sql` trước
   - Sau đó chạy `migration_add_payment_account_to_orders.sql`
   - Cuối cùng chạy `migration_verify_payment_accounts.sql` (nếu cần)

2. **Idempotent:**
   - Tất cả các migration đều idempotent (có thể chạy nhiều lần an toàn)
   - Chúng sẽ kiểm tra xem cột/constraint đã tồn tại chưa trước khi thêm

3. **Unique constraint:**
   - MySQL: Sử dụng UNIQUE constraint với isDefault
   - PostgreSQL: Unique constraint được xử lý ở application level vì cách xử lý NULL khác nhau

4. **Backup:**
   - Luôn backup database trước khi chạy migration
   - Đặc biệt quan trọng nếu đã có dữ liệu trong production

## Kiểm tra sau migration

```sql
-- MySQL
DESCRIBE payment_accounts;
SHOW INDEX FROM payment_accounts;
DESCRIBE orders; -- Kiểm tra cột paymentAccountId

-- PostgreSQL
\d payment_accounts
\d orders -- Kiểm tra cột paymentAccountId
```

## Troubleshooting

### Lỗi "Column already exists"
- Migration đã được chạy trước đó
- Có thể bỏ qua hoặc chạy migration verify để kiểm tra

### Lỗi "Foreign key constraint fails"
- Đảm bảo bảng `stores` đã tồn tại
- Kiểm tra xem có dữ liệu trong `stores` không

### Lỗi "Table doesn't exist"
- Chạy migration tạo bảng trước
- Kiểm tra tên database có đúng không






























