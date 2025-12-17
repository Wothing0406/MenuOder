# 💻 Chạy Migration Từ Máy Local (Windows)

## 🎯 Mục Đích

Cập nhật các cột và bảng còn thiếu trong database trên Render từ máy Windows của bạn.

## 📋 Connection String Của Bạn

```
postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a.oregon-postgres.render.com/menu_order_db_wfa4
```

## ✅ Cách 1: Chạy Với Connection String Trực Tiếp (Khuyến Nghị)

### Bước 1: Mở PowerShell hoặc CMD

- Nhấn `Win + X` → Chọn **"Windows PowerShell"** hoặc **"Terminal"**
- Hoặc tìm "PowerShell" trong Start Menu

### Bước 2: Di Chuyển Đến Thư Mục Backend

```powershell
cd C:\Users\MatchaLatte\Downloads\clone\backend
```

### Bước 3: Chạy Script

**PowerShell:**
```powershell
node scripts/update-database-local.js "postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a.oregon-postgres.render.com/menu_order_db_wfa4"
```

**CMD:**
```cmd
node scripts/update-database-local.js "postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a.oregon-postgres.render.com/menu_order_db_wfa4"
```

---

## ✅ Cách 2: Dùng Environment Variable

### Bước 1: Set Environment Variable

**PowerShell:**
```powershell
cd C:\Users\MatchaLatte\Downloads\clone\backend
$env:DATABASE_URL="postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a.oregon-postgres.render.com/menu_order_db_wfa4"
```

**CMD:**
```cmd
cd C:\Users\MatchaLatte\Downloads\clone\backend
set DATABASE_URL=postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a.oregon-postgres.render.com/menu_order_db_wfa4
```

### Bước 2: Chạy Script

```powershell
node scripts/update-database-local.js
```

---

## ✅ Cách 3: Thêm Vào File .env

### Bước 1: Mở File .env

Tạo hoặc mở file: `backend\.env`

### Bước 2: Thêm Connection String

```env
DATABASE_URL=postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a.oregon-postgres.render.com/menu_order_db_wfa4
```

### Bước 3: Chạy Script

```powershell
cd C:\Users\MatchaLatte\Downloads\clone\backend
node scripts/update-database-local.js
```

---

## 📊 Kết Quả Mong Đợi

Sau khi chạy, bạn sẽ thấy:

```
📊 Database Info:
   Host: dpg-d4j8lg6uk2gs73bfdtqg-a.oregon-postgres.render.com
   Database: menu_order_db_wfa4
   User: menu_order_db_wfa4_user

🔌 Đang kết nối đến database...
✅ Kết nối database thành công!

🚀 Bắt đầu cập nhật database...

============================================================

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
   Tất cả các cột và bảng cần thiết đã được thêm.
```

---

## 🆘 Nếu Gặp Lỗi

### Lỗi: "Cannot find module 'pg'"

**Giải pháp:**
```powershell
cd backend
npm install
```

### Lỗi: "Connection timeout"

**Giải pháp:**
- Kiểm tra kết nối internet
- Database có thể đang sleep (Render free tier)
- Thử lại sau vài giây

### Lỗi: "permission denied"

**Giải pháp:**
- Kiểm tra connection string đúng chưa
- Database user cần quyền `ALTER TABLE`

### Lỗi: "node: command not found"

**Giải pháp:**
- Cài đặt Node.js: https://nodejs.org/
- Hoặc dùng `nodejs` thay vì `node` (trên một số hệ thống)

---

## 🔒 Bảo Mật

⚠️ **LƯU Ý:** 
- Connection string chứa password
- **KHÔNG** commit file `.env` vào Git
- **KHÔNG** chia sẻ connection string
- Sau khi dùng xong, có thể xóa khỏi `.env` (nếu muốn)

---

## ✅ Checklist

- [ ] Đã mở PowerShell/CMD
- [ ] Đã cd vào thư mục `backend`
- [ ] Đã chạy script với connection string
- [ ] Thấy message: `✨ Hoàn tất! Database đã được cập nhật.`
- [ ] Đã kiểm tra cột paymentAccountId tồn tại

---

## 🚀 Lệnh Nhanh (Copy & Paste)

**PowerShell:**
```powershell
cd C:\Users\MatchaLatte\Downloads\clone\backend
node scripts/update-database-local.js "postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a.oregon-postgres.render.com/menu_order_db_wfa4"
```

**CMD:**
```cmd
cd C:\Users\MatchaLatte\Downloads\clone\backend
node scripts\update-database-local.js "postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a.oregon-postgres.render.com/menu_order_db_wfa4"
```

---

**Chúc bạn thành công! 🎉**









