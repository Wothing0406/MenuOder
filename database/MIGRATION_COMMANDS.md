# Lệnh Migration và Reset Database

## 📋 Các lệnh có sẵn

### 1. Reset Database (Xóa và tạo lại từ đầu)
```bash
cd backend
npm run reset-db
```

Lệnh này sẽ:
- Xóa database cũ (nếu có)
- Tạo lại database và tất cả các bảng
- Thêm dữ liệu mẫu (seed data)

**⚠️ Lưu ý:** Lệnh này sẽ **XÓA TẤT CẢ** dữ liệu hiện có!

### 2. Apply Migration (Áp dụng thay đổi database)
```bash
cd backend
npm run apply-migration
```

Lệnh này sẽ:
- Kiểm tra và thêm các cột mới (nếu chưa có)
- Không xóa dữ liệu hiện có
- An toàn để chạy nhiều lần

## 🔄 Quy trình khi có thay đổi database mới

Nếu bạn đã có database và muốn thêm tính năng mới:

1. **Chạy migration** (an toàn, không mất dữ liệu):
   ```bash
   cd backend
   npm run apply-migration
   ```

2. Nếu muốn **bắt đầu lại từ đầu** (sẽ mất dữ liệu):
   ```bash
   cd backend
   npm run reset-db
   ```

## 📝 Migration mới nhất

- `migration_add_vouchers.sql` - Thêm bảng `vouchers`, cột `role` cho `users` và các cột giảm giá trong `orders` để hỗ trợ quản lý mã khuyến mãi
- `migration_add_detailed_address.sql` - Thêm trường `storeDetailedAddress` để chủ quán có thể thêm địa chỉ chi tiết

## 🔍 Kiểm tra database

Để kiểm tra xem migration đã được apply chưa, bạn có thể chạy SQL:

```sql
USE menu_order_db;
DESCRIBE stores;
```

Kiểm tra xem có cột `storeDetailedAddress` chưa.

## 💡 Tips

- Luôn backup database trước khi chạy reset
- Dùng `apply-migration` khi muốn giữ lại dữ liệu
- Dùng `reset-db` khi muốn bắt đầu lại với dữ liệu mẫu

