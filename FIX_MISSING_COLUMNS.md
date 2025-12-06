# 🔧 Fix Lỗi "Column does not exist" trên Render

## ❌ Lỗi: `column "role" does not exist`

Lỗi này xảy ra khi schema trên database PostgreSQL chưa có cột `role` trong bảng `users`.

## 🔍 Nguyên Nhân

- Schema chưa được sync với `alter: true` để thêm cột mới
- Migration chưa được chạy
- Database được tạo từ schema cũ không có cột `role`

## ✅ Cách Fix

### Cách 1: Chạy Script Migration (Khuyến nghị)

**Từ máy local:**

1. Đảm bảo `.env` có `DATABASE_URL` trỏ đến database trên Render:
   ```env
   DATABASE_URL=postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a/menu_order_db_wfa4
   ```

2. Chạy script:
   ```bash
   cd backend
   npm run add-role-column
   ```

Script sẽ:
- ✅ Kiểm tra xem cột đã tồn tại chưa
- ✅ Tạo ENUM type nếu cần
- ✅ Thêm cột `role` với giá trị mặc định `'store_owner'`

### Cách 2: Sync Schema với alter: true (Tự động)

Code đã được cập nhật để tự động sync với `alter: true` trên Render/production.

**Chỉ cần restart service trên Render:**

1. Vào **Render Dashboard** → **Services**
2. Click **Restart** service backend
3. Service sẽ tự động thêm cột `role` khi khởi động

**Logs sẽ hiển thị:**
```
🔄 Syncing database models...
✅ Database synchronized successfully
```

### Cách 3: Chạy SQL Trực Tiếp (Nếu cần)

Nếu có quyền truy cập database trực tiếp:

```sql
-- Tạo ENUM type (nếu chưa có)
CREATE TYPE enum_users_role AS ENUM ('store_owner', 'admin');

-- Thêm cột role
ALTER TABLE users 
ADD COLUMN role enum_users_role NOT NULL DEFAULT 'store_owner';
```

## 🔍 Kiểm Tra Sau Khi Fix

Sau khi chạy migration, kiểm tra:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';
```

Kết quả nên có:
- `column_name`: `role`
- `data_type`: `USER-DEFINED` (enum)
- `column_default`: `'store_owner'::enum_users_role`

## ⚠️ Lưu Ý

1. **Giá trị mặc định**: Tất cả users hiện tại sẽ có `role = 'store_owner'`
2. **Không mất dữ liệu**: Migration chỉ thêm cột, không xóa dữ liệu
3. **An toàn**: Có thể chạy nhiều lần (sẽ bỏ qua nếu cột đã tồn tại)

## 🎯 Khuyến Nghị

**Cách nhanh nhất:**
1. Restart service trên Render (code đã tự động sync với alter: true)
2. Hoặc chạy `npm run add-role-column` từ local

**Sau khi fix:**
- Login sẽ hoạt động bình thường
- Tất cả users sẽ có `role = 'store_owner'` mặc định
- Có thể cập nhật role sau nếu cần

---

**Sau khi fix, thử login lại và kiểm tra!**

