# 🔧 Xử Lý Vấn Đề Cache và Dữ Liệu Cũ

## ❓ Vấn Đề: Đã push code mới lên GitHub nhưng vẫn thấy dữ liệu cũ

### 🔍 Nguyên nhân có thể:

1. **Frontend Cache** - Trình duyệt đang cache JavaScript cũ
2. **Backend chưa restart** - Service chưa reload code mới
3. **Database chưa migrate** - Database trên Render chưa có trạng thái 'completed'
4. **Build cache** - Next.js cache build cũ

---

## ✅ Cách Xử Lý

### 1. Clear Browser Cache (Quan Trọng Nhất!)

**Chrome/Edge:**
- Nhấn `Ctrl + Shift + Delete`
- Chọn "Cached images and files"
- Chọn "All time"
- Click "Clear data"

**Hoặc Hard Refresh:**
- Windows: `Ctrl + F5` hoặc `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**Hoặc:**
- Mở Developer Tools (F12)
- Right-click vào nút Refresh
- Chọn "Empty Cache and Hard Reload"

### 2. Kiểm Tra Backend Đã Deploy Mới Chưa

1. Vào Render Dashboard
2. Kiểm tra **Deploy Logs** xem có deploy mới từ commit mới nhất không
3. Kiểm tra **Runtime Logs** xem có lỗi không
4. Nếu cần, click **"Manual Deploy"** → **"Clear build cache & deploy"**

### 3. Kiểm Tra Database Đã Có Trạng Thái 'completed' Chưa

**Cách 1: Dùng Render Shell**

1. Vào Render Dashboard → Backend Service → **Shell**
2. Chạy:

```bash
psql $DATABASE_URL
```

3. Trong psql, chạy:

```sql
-- Kiểm tra constraint hiện tại
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass 
AND conname LIKE '%status%';

-- Xem cấu trúc bảng
\d orders
```

**Cách 2: Dùng PowerShell (Từ máy local)**

Nếu đã cài PostgreSQL client, chạy:

```powershell
# Kết nối và kiểm tra
$env:PGPASSWORD="YOuvv1yii0cC34ukdDhzY2rtM88p3pPL"
psql -h dpg-d4j8lg6uk2gs73bfdtqg-a -U menu_order_db_wfa4_user -d menu_order_db_wfa4 -c "\d orders"
```

### 4. Apply Migration Nếu Chưa Có

**Nếu database chưa có trạng thái 'completed', chạy migration:**

**Trên Render Shell:**
```bash
psql $DATABASE_URL -c "ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check; ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'));"
```

**Hoặc từ PowerShell:**
```powershell
$env:PGPASSWORD="YOuvv1yii0cC34ukdDhzY2rtM88p3pPL"
$sql = "ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check; ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'));"
echo $sql | psql -h dpg-d4j8lg6uk2gs73bfdtqg-a -U menu_order_db_wfa4_user -d menu_order_db_wfa4
```

### 5. Force Rebuild Frontend

1. Vào Render Dashboard → Frontend Service
2. Click **"Manual Deploy"**
3. Chọn **"Clear build cache & deploy"**
4. Chờ deploy xong

### 6. Kiểm Tra Environment Variables

Đảm bảo các biến môi trường đã được cập nhật:
- `DATABASE_URL` (cho backend)
- `NEXT_PUBLIC_API_URL` (cho frontend)

---

## 🚀 Quick Fix Commands

### Lệnh PowerShell Để Kiểm Tra và Migrate:

```powershell
# Set password (chỉ cần làm 1 lần trong session này)
$env:PGPASSWORD="YOuvv1yii0cC34ukdDhzY2rtM88p3pPL"

# Kiểm tra cấu trúc bảng orders
psql -h dpg-d4j8lg6uk2gs73bfdtqg-a -U menu_order_db_wfa4_user -d menu_order_db_wfa4 -c "\d orders"

# Apply migration nếu cần
psql -h dpg-d4j8lg6uk2gs73bfdtqg-a -U menu_order_db_wfa4_user -d menu_order_db_wfa4 -c "ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check; ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'));"
```

### Hoặc Dùng File SQL:

```powershell
# Tạo file SQL
@"
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'));
"@ | Out-File -FilePath migration.sql -Encoding UTF8

# Chạy file SQL
$env:PGPASSWORD="YOuvv1yii0cC34ukdDhzY2rtM88p3pPL"
psql -h dpg-d4j8lg6uk2gs73bfdtqg-a -U menu_order_db_wfa4_user -d menu_order_db_wfa4 -f migration.sql

# Xóa file
Remove-Item migration.sql
```

---

## ✅ Checklist

- [ ] Đã clear browser cache (Ctrl + F5)
- [ ] Đã kiểm tra backend deploy logs
- [ ] Đã kiểm tra database có trạng thái 'completed'
- [ ] Đã apply migration nếu cần
- [ ] Đã force rebuild frontend với clear cache
- [ ] Đã kiểm tra environment variables

---

## 🐛 Debug Steps

1. **Mở Developer Tools** (F12) → Tab **Network**
2. **Refresh trang** (Ctrl + F5)
3. Kiểm tra các request đến API có trả về data mới không
4. Kiểm tra Console có lỗi JavaScript không

---

**Chúc bạn giải quyết vấn đề thành công! 🚀**

