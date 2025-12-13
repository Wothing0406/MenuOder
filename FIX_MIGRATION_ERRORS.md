# 🔧 Đã Sửa Lỗi Migration

## ✅ Các Lỗi Đã Sửa

### 1. ❌ Syntax Error: `columnsToAdd` already declared
**Đã sửa:** Xóa duplicate code trong:
- `add-missing-store-columns.js`
- `add-missing-order-columns.js`

### 2. ❌ Connection Error: `read ECONNRESET`
**Đã sửa:**
- Thêm retry logic (thử lại 3 lần)
- Bật SSL cho PostgreSQL (Render yêu cầu SSL)
- Tăng timeout cho connection

### 3. ❌ Chỉ hỗ trợ MySQL
**Đã sửa:** Tất cả scripts giờ hỗ trợ cả MySQL và PostgreSQL

---

## 🚀 Chạy Lại Migration

### Cách 1: Chạy Tất Cả Migrations

```powershell
cd C:\Users\MatchaLatte\Downloads\clone\backend
node scripts/update-database-local.js "postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a.oregon-postgres.render.com/menu_order_db_wfa4"
```

### Cách 2: Chạy Từng Migration Riêng

```powershell
cd C:\Users\MatchaLatte\Downloads\clone\backend

# Set connection string
$env:DATABASE_URL="postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a.oregon-postgres.render.com/menu_order_db_wfa4"

# Chạy từng migration
node scripts/add-missing-store-columns.js
node scripts/add-paymentAccountId-to-orders.js
node scripts/add-missing-order-columns.js
```

---

## 📊 Kết Quả Mong Đợi

Sau khi chạy, bạn sẽ thấy:

```
📊 Database type: postgres

🔌 Đang kết nối đến database...
✅ Kết nối database thành công!

📦 Add missing store columns...
✅ Add missing store columns - Hoàn tất!

📦 Add paymentAccountId to orders...
✅ Add paymentAccountId to orders - Hoàn tất!

📦 Add missing order columns...
✅ Add missing order columns - Hoàn tất!

============================================================
📊 TỔNG KẾT
============================================================
✅ Thành công: 3
⏭️  Đã tồn tại (bỏ qua): 0
❌ Lỗi: 0
============================================================

🔍 Kiểm tra cột paymentAccountId...
✅ Cột paymentAccountId đã tồn tại!
   Type: integer
   Nullable: YES

✨ Hoàn tất! Database đã được cập nhật.
```

---

## 🆘 Nếu Vẫn Gặp Lỗi Connection

### Lỗi: "read ECONNRESET" hoặc "Connection timeout"

**Giải pháp:**

1. **Kiểm tra kết nối internet**
2. **Database có thể đang sleep** (Render free tier)
   - Đợi vài giây rồi thử lại
   - Hoặc truy cập database từ Render Dashboard để "wake up" database
3. **Thử lại với retry:**
   - Script đã có retry logic tự động
   - Nếu vẫn lỗi, thử lại sau 1-2 phút

### Lỗi: "SSL required"

**Đã sửa:** Script giờ tự động bật SSL cho PostgreSQL

---

## ✅ Checklist

- [ ] Đã cd vào thư mục `backend`
- [ ] Đã chạy script với connection string
- [ ] Thấy message: `✅ Kết nối database thành công!`
- [ ] Tất cả migrations chạy thành công
- [ ] Cột paymentAccountId đã được thêm

---

**Chạy lại script và cho tôi biết kết quả! 🚀**

