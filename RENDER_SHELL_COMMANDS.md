# 🖥️ Lệnh Render Shell - Fix paymentAccountId

## 🚀 Cách Vào Render Shell

1. Đăng nhập vào [Render Dashboard](https://dashboard.render.com)
2. Chọn **Web Service** của bạn
3. Click **"Shell"** ở menu bên trái
4. Shell sẽ mở trong browser

---

## ⚡ Lệnh Fix Ngay (Copy & Paste)

```bash
cd backend
node scripts/add-paymentAccountId-to-orders.js
```

---

## 📋 Các Lệnh Khác

### Chạy Tất Cả Migrations

```bash
cd backend
npm run migrate
```

### Chạy Migration Cụ Thể

```bash
cd backend
npm run migrate:paymentAccountId
```

### Kiểm Tra Database Schema

```bash
cd backend
node scripts/check-database-schema.js
```

### Kiểm Tra Kết Nối Database

```bash
cd backend
npm run test-db
```

---

## ✅ Kết Quả Mong Đợi

Sau khi chạy `node scripts/add-paymentAccountId-to-orders.js`, bạn sẽ thấy:

```
🔌 Đang kết nối đến database...
✅ Kết nối database thành công!

📊 Database type: postgres

➕ Đang thêm cột paymentAccountId vào bảng orders...
✅ Đã thêm cột paymentAccountId thành công!
✅ Xác nhận: Cột paymentAccountId đã được thêm!
   - Type: integer
   - Nullable: YES

✨ Hoàn tất migration!
```

---

## 🆘 Nếu Gặp Lỗi

### Lỗi: "permission denied"

**Giải pháp:**
- Kiểm tra database user có quyền `ALTER TABLE`
- Liên hệ Render support nếu cần

### Lỗi: "relation 'orders' does not exist"

**Giải pháp:**
- Bảng orders chưa được tạo
- Chạy: `npm run migrate` để tạo tất cả bảng

### Lỗi: "column already exists"

**Giải pháp:**
- ✅ Cột đã tồn tại rồi!
- Restart service và test lại

---

## 📝 Lưu Ý

- Shell session sẽ timeout sau một thời gian không dùng
- Nếu shell đóng, mở lại và chạy lại lệnh
- Sau khi chạy migration, **restart service** để áp dụng thay đổi

