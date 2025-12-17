# 🚀 Cập Nhật Database Ngay Lập Tức

## 📋 Connection String Của Bạn

```
postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a.oregon-postgres.render.com/menu_order_db_wfa4
```

## ✅ Cách 1: Chạy Trực Tiếp (Khuyến Nghị)

### Bước 1: Vào Render Shell

1. Đăng nhập [Render Dashboard](https://dashboard.render.com)
2. Chọn **Web Service** của bạn
3. Click **"Shell"**

### Bước 2: Chạy Script

```bash
cd backend
node scripts/update-database-complete.js
```

**Script này sẽ:**
- ✅ Tự động kết nối database (dùng DATABASE_URL từ Environment Variables)
- ✅ Chạy tất cả migrations cần thiết
- ✅ Thêm các cột còn thiếu:
  - `paymentAccountId` vào bảng `orders`
  - Các cột khác trong `stores` và `orders`
- ✅ Báo cáo kết quả chi tiết

---

## ✅ Cách 2: Chạy Với Connection String Trực Tiếp

Nếu muốn chạy từ local hoặc với connection string cụ thể:

### Trên Local (Windows PowerShell):

```powershell
cd backend
$env:DATABASE_URL="postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a.oregon-postgres.render.com/menu_order_db_wfa4"
node scripts/update-database-with-connection.js
```

### Hoặc:

```powershell
cd backend
node scripts/update-database-with-connection.js "postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a.oregon-postgres.render.com/menu_order_db_wfa4"
```

---

## ✅ Cách 3: Chạy Từng Migration Riêng

Nếu muốn kiểm soát từng bước:

```bash
cd backend
node scripts/add-missing-store-columns.js
node scripts/add-paymentAccountId-to-orders.js
node scripts/add-missing-order-columns.js
```

---

## 📊 Kết Quả Mong Đợi

Sau khi chạy, bạn sẽ thấy:

```
🔌 Đang kết nối đến database...
✅ Kết nối database thành công!

📊 Database type: postgres

🚀 Bắt đầu cập nhật database...

📦 Add missing store columns...
✅ Add missing store columns - Hoàn tất!

📦 Add paymentAccountId to orders...
✅ Add paymentAccountId to orders - Hoàn tất!

📦 Add missing order columns...
✅ Add missing order columns - Hoàn tất!

============================================================
📊 TỔNG KẾT CẬP NHẬT DATABASE
============================================================
✅ Thành công: 3
⏭️  Đã tồn tại (bỏ qua): 0
❌ Lỗi: 0
============================================================

🔍 Kiểm tra các cột quan trọng...
✅ Tất cả các cột quan trọng đã có!

✨ Cập nhật database hoàn tất!
```

---

## 🔍 Kiểm Tra Sau Khi Chạy

### Test 1: Kiểm Tra Cột paymentAccountId

Vào Render Shell:

```bash
cd backend
node -e "const {sequelize} = require('./src/config/database'); sequelize.query(\"SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'paymentAccountId'\").then(([rows]) => { console.log(rows.length > 0 ? '✅ Cột đã tồn tại!' : '❌ Cột chưa tồn tại'); process.exit(0); });"
```

### Test 2: Test Tạo Đơn Hàng

1. Tạo đơn hàng mới
2. Nếu **KHÔNG** có lỗi `column "paymentAccountId" does not exist` → ✅ **Đã fix!**

---

## 🆘 Nếu Gặp Lỗi

### Lỗi: "permission denied"

**Giải pháp:**
- Database user cần quyền `ALTER TABLE`
- Kiểm tra lại connection string

### Lỗi: "relation 'orders' does not exist"

**Giải pháp:**
- Bảng `orders` chưa được tạo
- Cần chạy migrations cơ bản trước

### Lỗi: "connection timeout"

**Giải pháp:**
- Kiểm tra kết nối mạng
- Database có thể đang sleep (Render free tier)
- Thử lại sau vài giây

---

## ✅ Checklist

- [ ] Đã vào Render Shell
- [ ] Đã chạy script update database
- [ ] Thấy message: `✨ Cập nhật database hoàn tất!`
- [ ] Đã kiểm tra cột paymentAccountId tồn tại
- [ ] Đã test tạo đơn hàng → Không còn lỗi

---

## 🔒 Bảo Mật

⚠️ **LƯU Ý:** Connection string chứa password. Sau khi dùng xong:
- ✅ Không commit connection string vào Git
- ✅ Chỉ dùng trong môi trường an toàn
- ✅ Đổi password nếu đã lộ

---

**Sau khi cập nhật xong, database sẽ có đầy đủ các cột và bảng cần thiết! 🎉**










