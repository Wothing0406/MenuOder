# 🔄 Hướng Dẫn Reset Database và Tải Lại Dữ Liệu

## Cách Nhanh Nhất

### Bước 1: Vào thư mục backend
```bash
cd online-menu-order/backend
```

### Bước 2: Chạy script reset
```bash
npm run reset-db
```

Script sẽ tự động:
- ✅ Xóa database cũ
- ✅ Tạo lại database và tất cả bảng
- ✅ Thêm dữ liệu mẫu đầy đủ

## Thông Tin Đăng Nhập Sau Khi Reset

- **Email:** `admin@restaurant.com`
- **Password:** `password123`
- **Store Slug:** `nha-hang-mau`
- **URL Menu:** `http://localhost:3000/store/nha-hang-mau`

## Dữ Liệu Mẫu Bao Gồm

### 1. User & Store
- 1 tài khoản admin
- 1 cửa hàng "Nhà Hàng Mẫu"

### 2. Categories (4 danh mục)
- Món Khai Vị
- Món Chính  
- Đồ Uống
- Tráng Miệng

### 3. Items (15 món)
- **Món Khai Vị:** Gỏi Cuốn, Nem Nướng, Chả Giò
- **Món Chính:** Phở Bò, Bún Bò Huế, Cơm Gà, Bánh Mì Thịt Nướng, Gà Chiên
- **Đồ Uống:** Nước Ngọt, Nước Cam, Trà Đá, Cà Phê Đen
- **Tráng Miệng:** Chè Đậu Xanh, Bánh Flan, Kem Dừa

### 4. Options & Accompaniments
- **Gà Chiên:** Có size options (Nhỏ/Vừa/Lớn) và 3 món kèm
- **Phở Bò:** Có size options, độ chín options và 3 món kèm

## Lưu Ý Quan Trọng

⚠️ **Script sẽ xóa TẤT CẢ dữ liệu hiện có!**

Hãy backup dữ liệu quan trọng trước khi chạy reset.

## Cách Khác: Sử Dụng MySQL Trực Tiếp

Nếu không muốn dùng script Node.js:

```bash
# Reset database
mysql -u root -p < online-menu-order/database/reset.sql

# Thêm dữ liệu mẫu
mysql -u root -p < online-menu-order/database/seed.sql
```

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra MySQL server đang chạy
- Kiểm tra file `.env` có cấu hình đúng
- Kiểm tra user/password MySQL

### Lỗi module not found
```bash
cd online-menu-order/backend
npm install
```

### Lỗi permission
Đảm bảo MySQL user có quyền CREATE và DROP database.

