# Migration: Thêm cột paymentAccountId vào bảng orders

## Vấn đề

Lỗi: `column "paymentAccountId" does not exist` khi tạo đơn hàng (dù là tiền mặt hay chuyển khoản).

## Nguyên nhân

Model Order có định nghĩa field `paymentAccountId`, nhưng cột này chưa được thêm vào database.

## Giải pháp

Chạy migration script để thêm cột `paymentAccountId` vào bảng `orders`.

### Cách 1: Chạy script migration trực tiếp

```bash
cd backend
node scripts/add-paymentAccountId-to-orders.js
```

Hoặc:

```bash
cd backend
npm run migrate:paymentAccountId
```

### Cách 2: Chạy tất cả migrations

```bash
cd backend
npm run migrate
```

### Cách 3: Sử dụng script tự động kiểm tra

```bash
cd backend
npm run ensure:paymentAccountId
```

## Lưu ý

- Script tự động detect database type (MySQL hoặc PostgreSQL)
- Script sẽ kiểm tra xem cột đã tồn tại chưa trước khi thêm
- An toàn để chạy nhiều lần (idempotent)

## Sau khi chạy migration

1. Kiểm tra log để đảm bảo migration thành công
2. Test tạo đơn hàng lại
3. Nếu vẫn lỗi, kiểm tra:
   - Database connection có đúng không
   - Có quyền ALTER TABLE không
   - Bảng `orders` có tồn tại không

## Production

Trên production server (Render, Heroku, etc.):

1. SSH vào server hoặc dùng console
2. Chạy migration script:
   ```bash
   cd backend
   node scripts/add-paymentAccountId-to-orders.js
   ```

Hoặc thêm vào deployment script để tự động chạy migration khi deploy.




