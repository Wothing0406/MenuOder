# Database Reset và Seed Data

## Hướng dẫn xóa dữ liệu cũ và tải lại dữ liệu mẫu

### Cách 1: Sử dụng Script Node.js (Khuyến nghị)

1. Đảm bảo đã cài đặt dependencies:
```bash
cd online-menu-order/backend
npm install
```

2. Kiểm tra file `.env` có cấu hình database đúng:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=menu_order_db
DB_USER=root
DB_PASSWORD=your_password
```

3. Chạy script reset:
```bash
npm run reset-db
```

Script sẽ:
- Xóa database cũ (nếu có)
- Tạo lại database và tất cả các bảng
- Thêm dữ liệu mẫu (user, store, categories, items, options, accompaniments)

### Cách 2: Sử dụng MySQL trực tiếp

1. Mở MySQL command line hoặc MySQL Workbench

2. Chạy file reset.sql:
```bash
mysql -u root -p < online-menu-order/database/reset.sql
```

3. Chạy file seed.sql:
```bash
mysql -u root -p < online-menu-order/database/seed.sql
```

### Thông tin đăng nhập mẫu

Sau khi chạy seed data, bạn có thể đăng nhập với:

- **Email:** admin@restaurant.com
- **Password:** password123
- **Store Slug:** nha-hang-mau
- **URL:** http://localhost:3000/store/nha-hang-mau

### Dữ liệu mẫu bao gồm:

1. **1 User và Store:**
   - Nhà Hàng Mẫu

2. **4 Categories:**
   - Món Khai Vị
   - Món Chính
   - Đồ Uống
   - Tráng Miệng

3. **15 Items:**
   - 3 món khai vị
   - 5 món chính (bao gồm Gà Chiên với options và accompaniments)
   - 4 đồ uống
   - 3 món tráng miệng

4. **Item Options và Accompaniments:**
   - Gà Chiên có size options và 3 món kèm
   - Phở Bò có size options, độ chín options và 3 món kèm

### Lưu ý:

- Script sẽ xóa TẤT CẢ dữ liệu hiện có trong database
- Hãy backup dữ liệu quan trọng trước khi chạy reset
- Đảm bảo MySQL server đang chạy trước khi thực hiện

