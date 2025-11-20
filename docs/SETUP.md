# Hướng Dẫn Cài Đặt & Chạy Dự Án MenuOrder

Dự án này do trường THPT Nguyễn Trãi thực hiện.

## 📋 Yêu Cầu Hệ Thống

- Node.js 14+ 
- npm hoặc yarn
- MySQL 5.7+
- Git (Optional)

## 🚀 Cài Đặt Backend

### 1. Vào thư mục backend
```bash
cd online-menu-order/backend
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Tạo file `.env` từ template
```bash
copy .env.example .env
```

Hoặc tạo file `.env` với nội dung:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=menu_order_db
DB_USER=root
DB_PASSWORD=

PORT=5000
NODE_ENV=development

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=24h

FRONTEND_URL=http://localhost:3000

UPLOAD_PATH=./uploads
```

### 4. Tạo Database

Mở MySQL command line hoặc MySQL Workbench và chạy:

```bash
mysql -u root -p < ../database/schema.sql
```

Hoặc copy/paste nội dung từ file `database/schema.sql` vào MySQL client.

### 5. Chạy server
```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:5000`

**Lưu ý:** Nếu muốn sử dụng production mode:
```bash
npm start
```

---

## 🎨 Cài Đặt Frontend

### 1. Vào thư mục frontend
```bash
cd online-menu-order/frontend
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Tạo file `.env.local` từ template
```bash
copy .env.local.example .env.local
```

Hoặc tạo file `.env.local` với nội dung:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Chạy development server
```bash
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`

### 5. Build production
```bash
npm run build
npm start
```

---

## 🗄️ Cấu Hình Database

### 1. Tạo Database thủ công

Nếu không thể chạy file SQL, hãy thực hiện các bước sau:

**Bước 1:** Tạo database
```sql
CREATE DATABASE menu_order_db;
USE menu_order_db;
```

**Bước 2:** Copy/paste toàn bộ nội dung từ file `database/schema.sql`

**Bước 3:** Chạy các lệnh SQL

### 2. Kiểm tra kết nối

Sửa file `backend/.env` nếu cần:
- `DB_HOST`: Địa chỉ MySQL server (mặc định: localhost)
- `DB_USER`: Tên user MySQL (mặc định: root)
- `DB_PASSWORD`: Mật khẩu MySQL

---

## 🧪 Test API

### Sử dụng Postman

1. Tải Postman từ https://www.postman.com/downloads/
2. Import file API collection (nếu có) hoặc tạo request thủ công
3. Base URL: `http://localhost:5000/api`

### Ví dụ Request:

**Register:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "store@example.com",
  "password": "password123",
  "storeName": "My Restaurant",
  "storePhone": "0123456789",
  "storeAddress": "123 Main St, City"
}
```

**Login:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "store@example.com",
  "password": "password123"
}
```

---

## 📱 Các Tính Năng Chính

### Cho Chủ Quán:

1. **Đăng ký / Đăng nhập**
   - Tạo tài khoản với email và password
   - Mỗi quán có URL riêng: `/store/{store_id}`

2. **Quản lý Menu**
   - Tạo/chỉnh sửa/xoá danh mục
   - Thêm/sửa/xoá món ăn
   - Thêm hình ảnh cho từng món
   - Tạo tùy chọn (size, topping, ghi chú)

3. **Tạo QR Code**
   - Hệ thống tự động tạo QR chứa link cửa hàng
   - Hỗ trợ download QR code để in

4. **Dashboard Quản Lý Đơn**
   - Xem tất cả đơn hàng
   - Thay đổi trạng thái đơn
   - Xem thống kê đơn hàng

### Cho Khách Hàng:

1. **Truy cập Menu**
   - Truy cập bằng link hoặc quét QR code
   - Xem danh sách món ăn

2. **Đặt Order**
   - Chọn món, chọn tùy chọn
   - Thêm vào giỏ hàng
   - Tự động tính tổng tiền

3. **Thanh Toán**
   - Nhập thông tin (tên, số điện thoại)
   - Chọn hình thức thanh toán
   - Gửi đơn hàng

---

## 🔧 Cấu Trúc Thư Mục

```
online-menu-order/
├── backend/
│   ├── src/
│   │   ├── config/         # Cấu hình database
│   │   ├── controllers/    # Xử lý logic
│   │   ├── middleware/     # Middleware
│   │   ├── models/         # Models Sequelize
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utilities
│   │   └── index.js        # Entry point
│   ├── .env.example        # Template biến môi trường
│   ├── package.json        # Dependencies
│   └── uploads/            # Thư mục upload file
│
├── frontend/
│   ├── pages/              # Next.js pages
│   │   ├── _app.jsx        # App entry
│   │   ├── index.jsx       # Home page
│   │   ├── login.jsx       # Login page
│   │   ├── register.jsx    # Register page
│   │   ├── checkout.jsx    # Checkout page
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── store/          # Store menu page
│   │   └── order-success/  # Order success page
│   ├── components/         # React components
│   ├── lib/                # Libraries (api, store)
│   ├── styles/             # CSS styles
│   ├── .env.local.example  # Template biến môi trường
│   └── package.json        # Dependencies
│
├── database/
│   └── schema.sql          # SQL schema
│
└── docs/
    ├── API_DOCUMENTATION.md # Tài liệu API
    └── SETUP.md             # Hướng dẫn cài đặt
```

---

## 🐛 Troubleshooting

### Backend không kết nối MySQL
- Kiểm tra MySQL service đang chạy
- Kiểm tra file `.env` có cấu hình đúng
- Kiểm tra username/password MySQL

### Frontend không kết nối Backend
- Kiểm tra backend đang chạy trên port 5000
- Kiểm tra `NEXT_PUBLIC_API_URL` trong `.env.local`
- Kiểm tra CORS settings

### Port bị chiếm
Backend chạy port 5000:
```bash
npm run dev -- -p 3001
```

Frontend chạy port 3000:
```bash
npm run dev -- -p 3001
```

---

## 📝 Mô Tả Models

### User
- email, password, storeName, storePhone, storeAddress

### Store
- userId, storeName, storeSlug, storePhone, storeAddress, storeDescription, storeLogo, storeImage, isActive

### Category
- storeId, categoryName, categoryDescription, displayOrder

### Item
- categoryId, storeId, itemName, itemDescription, itemPrice, itemImage, isAvailable, displayOrder

### ItemOption
- itemId, optionName, optionType (select/multiselect/text), optionValues (JSON), isRequired, displayOrder

### Order
- storeId, orderCode, customerName, customerPhone, customerEmail, customerNote, totalAmount, status, paymentMethod, isPaid

### OrderItem
- orderId, itemId, itemName, itemPrice, quantity, selectedOptions (JSON), notes, subtotal

---

## 🔐 Bảo Mật

1. **JWT Token**
   - Token hết hạn sau 24 giờ
   - Lưu trong localStorage

2. **Password Hashing**
   - Sử dụng bcryptjs

3. **CORS**
   - Cấu hình cho phép localhost:3000

4. **Validation**
   - Kiểm tra input trên backend

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra log console
2. Kiểm tra network tab trong DevTools
3. Kiểm tra cấu hình `.env`

---

## 📄 License

Dự án này được thực hiện bởi trường THPT Nguyễn Trãi.

---

## ✨ Các Tính Năng Tương Lai (Optional)

- Upload hình ảnh cho items
- Multi-language support
- Payment gateway integration (Stripe, PayPal)
- Email notifications
- SMS notifications
- Analytics dashboard
- User reviews và ratings
- Inventory management

---

**Chúc bạn thành công!** 🎉
