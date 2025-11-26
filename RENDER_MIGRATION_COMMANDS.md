# 🚀 Lệnh Nhanh Để Apply Migration Trên Render

## ⚡ Cách 1: Dùng PowerShell (Từ Máy Local)

### Bước 1: Cài PostgreSQL Client (Nếu Chưa Có)

```powershell
winget install PostgreSQL.PostgreSQL
```

Hoặc download từ: https://www.postgresql.org/download/windows/

### Bước 2: Chạy Migration

```powershell
# Lệnh đơn giản nhất
$env:PGPASSWORD="YOuvv1yii0cC34ukdDhzY2rtM88p3pPL"
psql -h dpg-d4j8lg6uk2gs73bfdtqg-a -U menu_order_db_wfa4_user -d menu_order_db_wfa4 -c "ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check; ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'));"
```

**Hoặc dùng script:**

```powershell
.\RENDER_QUICK_MIGRATION.ps1
```

---

## ⚡ Cách 2: Dùng Render Shell

### Bước 1: Vào Render Dashboard

1. Truy cập: https://dashboard.render.com
2. Chọn **Backend Service**
3. Click tab **"Shell"**

### Bước 2: Chạy Lệnh

```bash
psql $DATABASE_URL
```

### Bước 3: Trong psql, chạy SQL:

```sql
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'));
\q
```

---

## ✅ Kiểm Tra Kết Quả

Sau khi chạy migration, kiểm tra:

```sql
-- Trong psql
\d orders

-- Hoặc
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'status';
```

---

## 🎯 Lệnh Một Dòng (PowerShell)

```powershell
$env:PGPASSWORD="YOuvv1yii0cC34ukdDhzY2rtM88p3pPL"; echo "ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check; ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'));" | psql -h dpg-d4j8lg6uk2gs73bfdtqg-a -U menu_order_db_wfa4_user -d menu_order_db_wfa4
```

---

**Chúc bạn thành công! 🚀**

