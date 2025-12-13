# 🚀 Hướng Dẫn Deploy với Auto Migration

## ❓ Câu Hỏi

**Khi up code lên GitHub rồi deploy backend lên Render (database ở Render) và frontend lên Vercel, có tự động cập nhật tất cả bảng và cột mới không?**

## ✅ Trả Lời

**CÓ** - Nếu bạn cấu hình đúng! Migrations sẽ tự động chạy khi server start.

---

## 🔧 Cấu Hình Render để Auto Migration

### Bước 1: Cấu Hình Environment Variables

Trong **Render Dashboard** → **Web Service** → **Environment**, thêm:

```env
# BẮT BUỘC: Bật auto migration
AUTO_MIGRATE=true
NODE_ENV=production

# Database (Render PostgreSQL)
DATABASE_URL=postgres://user:password@host:port/database
# HOẶC nếu dùng MySQL external:
DB_TYPE=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=your-database

# JWT
JWT_SECRET=your-secret-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# URLs
BACKEND_URL=https://your-backend.onrender.com
FRONTEND_URL=https://your-frontend.vercel.app
```

### Bước 2: Cấu Hình Build & Start Commands

Trong **Render Dashboard** → **Web Service** → **Settings**:

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm start
```

**Root Directory:**
```
backend
```

⚠️ **QUAN TRỌNG:** 
- ❌ **KHÔNG** chạy migrations trong Build Command
- ✅ Migrations sẽ tự động chạy trong Start Command (khi `AUTO_MIGRATE=true`)

---

## 🔄 Cách Hoạt Động

### Khi Server Start:

1. Server kết nối database
2. **Nếu `AUTO_MIGRATE=true` và `NODE_ENV=production`:**
   - Tự động chạy tất cả migration scripts:
     - `add-missing-store-columns.js`
     - `add-paymentAccountId-to-orders.js` ⭐ (cột mới)
     - `add-missing-order-columns.js`
3. Server tiếp tục start bình thường

### Logs Bạn Sẽ Thấy:

```
✅ Database connection established
🔄 Running automatic migrations in production...
📦 Running: add-missing-store-columns.js...
✅ add-missing-store-columns.js completed
📦 Running: add-paymentAccountId-to-orders.js...
✅ add-paymentAccountId-to-orders.js completed
📦 Running: add-missing-order-columns.js...
✅ add-missing-order-columns.js completed
✨ All migrations completed successfully!
✅ Migrations completed
✅ Database synchronized
🚀 Server running on http://0.0.0.0:5002
```

---

## 📋 Checklist Deploy

### Trước Khi Deploy:

- [ ] Code đã được push lên GitHub
- [ ] Database trên Render đã được tạo
- [ ] Environment Variables đã được set (bao gồm `AUTO_MIGRATE=true`)

### Sau Khi Deploy:

- [ ] Vào Render Dashboard → Logs
- [ ] Kiểm tra có dòng: `✅ Migrations completed`
- [ ] Test API: `https://your-backend.onrender.com/health`
- [ ] Test tạo đơn hàng (để kiểm tra cột `paymentAccountId`)

---

## 🛠️ Nếu Migration Không Tự Động Chạy

### Cách 1: Chạy Manual Migration (Khuyến Nghị)

1. Vào **Render Dashboard** → **Web Service** → **Shell**
2. Chạy:

```bash
cd backend
npm run migrate:paymentAccountId
```

Hoặc chạy tất cả migrations:

```bash
cd backend
npm run migrate
```

### Cách 2: Kiểm Tra Environment Variables

Đảm bảo có:
- ✅ `AUTO_MIGRATE=true` (không phải `false` hoặc không có)
- ✅ `NODE_ENV=production`

### Cách 3: Xem Logs Chi Tiết

Vào **Render Dashboard** → **Logs** và tìm:
- ❌ Nếu thấy: `⚠️ Migration error` → Xem chi tiết lỗi
- ✅ Nếu thấy: `✅ Migrations completed` → Đã chạy thành công

---

## 🔍 Kiểm Tra Cột Đã Được Thêm Chưa

### Cách 1: Test Tạo Đơn Hàng

1. Tạo đơn hàng mới (tiền mặt hoặc chuyển khoản)
2. Nếu không có lỗi `column "paymentAccountId" does not exist` → ✅ Đã có cột

### Cách 2: Chạy Script Kiểm Tra

Vào **Render Shell**:

```bash
cd backend
node scripts/check-database-schema.js
```

---

## 📝 Lưu Ý Quan Trọng

### ✅ Migrations Tự Động Chạy Khi:

- `AUTO_MIGRATE=true` (hoặc không set, mặc định là `true`)
- `NODE_ENV=production`
- Server start lần đầu sau khi deploy code mới

### ⚠️ Migrations KHÔNG Tự Động Chạy Khi:

- `AUTO_MIGRATE=false`
- `NODE_ENV=development`
- Database chưa được tạo
- Environment Variables chưa được set

### 🔒 An Toàn:

- Migrations scripts là **idempotent** (an toàn chạy nhiều lần)
- Nếu cột đã tồn tại, script sẽ bỏ qua
- Không làm mất dữ liệu hiện có

---

## 🎯 Tóm Tắt

| Câu Hỏi | Trả Lời |
|---------|---------|
| Có tự động cập nhật bảng/cột mới không? | ✅ **CÓ** - Nếu set `AUTO_MIGRATE=true` |
| Khi nào migrations chạy? | Khi server start (sau khi deploy) |
| Cần làm gì để bật auto migration? | Set `AUTO_MIGRATE=true` trong Render Environment Variables |
| Nếu không tự động thì sao? | Chạy manual: `npm run migrate:paymentAccountId` trong Render Shell |

---

## 🆘 Cần Giúp?

Nếu vẫn gặp vấn đề:

1. **Kiểm tra logs** trong Render Dashboard
2. **Chạy manual migration** trong Render Shell
3. **Kiểm tra Environment Variables** đã đúng chưa
4. **Test tạo đơn hàng** để xác nhận cột đã có

---

**Chúc bạn deploy thành công! 🎉**

