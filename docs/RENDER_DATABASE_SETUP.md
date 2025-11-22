# 🗄️ Hướng Dẫn Setup Database Trên Render

## Option 1: Sử Dụng PostgreSQL (Render Managed - Miễn Phí) ⭐ Khuyến Nghị

### Bước 1: Tạo PostgreSQL Database trên Render

1. **Đăng nhập Render Dashboard**
   - Truy cập: https://dashboard.render.com
   - Đăng nhập bằng GitHub account

2. **Tạo PostgreSQL Database**
   - Click nút **"New +"** ở góc trên bên trái
   - Chọn **"PostgreSQL"**
   - Điền thông tin:
     - **Name**: `menuorder-db` (tên bất kỳ bạn muốn)
     - **Database**: `menu_order_db` (hoặc để mặc định)
     - **User**: Tự động tạo
     - **Region**: Chọn gần nhất (ví dụ: Singapore)
     - **PostgreSQL Version**: 15 (hoặc mới nhất)
     - **Plan**: **Free** (512 MB RAM, 1 GB storage - đủ cho dự án nhỏ)
   - Click **"Create Database"**

3. **Lấy Connection String**
   - Sau khi tạo xong, Render sẽ hiển thị **Internal Database URL** và **External Database URL**
   - Copy **Internal Database URL** (để dùng trong Render service)
   - Format: `postgresql://user:password@host:port/database`

### Bước 2: Cập Nhật Code Backend để Dùng PostgreSQL

#### 2.1. Cài Đặt PostgreSQL Driver

Cần cài thêm package `pg` và `pg-hstore`:

```bash
cd backend
npm install pg pg-hstore
```

#### 2.2. Cập Nhật Database Config

File: `backend/src/config/database.js`

**Thay đổi:**
- `dialect: 'mysql'` → `dialect: 'postgres'`
- Sequelize sẽ tự động parse connection string từ Render

#### 2.3. Cập Nhật Models

Sequelize models đã tương thích với PostgreSQL, nhưng cần kiểm tra:
- `AUTO_INCREMENT` → `SERIAL` (Sequelize tự động xử lý)
- `ENUM` types (PostgreSQL hỗ trợ tốt)
- `JSON` types (PostgreSQL hỗ trợ tốt)

### Bước 3: Cấu Hình Environment Variables trên Render

Vào **Backend Service** → **Environment** → Thêm/sửa các biến:

#### Cách 1: Dùng Connection String (Đơn Giản Nhất) ⭐

```
DATABASE_URL=postgresql://user:password@hostname:port/database
```

Render tự động tạo biến `DATABASE_URL` cho PostgreSQL service, bạn chỉ cần:
- Vào PostgreSQL service → **Connections** → Copy **Internal Database URL**
- Paste vào Backend service Environment Variables với tên `DATABASE_URL`

#### Cách 2: Dùng Các Biến Riêng Lẻ

Nếu muốn tách riêng (parse từ Internal Database URL):

```
DB_HOST=dbs-xxxxx.xxxx.render.com
DB_PORT=5432
DB_NAME=menu_order_db_xxxx
DB_USER=menuorder_user_xxxx
DB_PASSWORD=xxxxxxx
```

### Bước 4: Cập Nhật Database Config File

File: `backend/src/config/database.js` cần hỗ trợ cả connection string và các biến riêng:

```javascript
const { Sequelize } = require('sequelize');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Nếu có DATABASE_URL thì dùng, không thì dùng các biến riêng
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    })
  : new Sequelize(
      process.env.DB_NAME || 'menu_order_db',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        dialectOptions: {
          ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
          } : false
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );

module.exports = {
  sequelize,
  Sequelize
};
```

### Bước 5: Link Database với Backend Service

1. Vào **Backend Service** trên Render
2. Tìm phần **"Connections"** hoặc **"Services"**
3. Click **"Link Database"** và chọn PostgreSQL service bạn vừa tạo
4. Render sẽ tự động thêm `DATABASE_URL` vào Environment Variables

### Bước 6: Deploy và Test

1. **Commit và push code** lên GitHub (đã cập nhật database config)
2. Render sẽ tự động deploy lại
3. Kiểm tra logs để xem database connection thành công

---

## Option 2: Sử Dụng MySQL External (Giữ Nguyên MySQL) 🐬

### Bước 1: Tạo MySQL Database Miễn Phí

**Tùy chọn A: PlanetScale (Khuyến nghị - Free tier tốt)**
1. Đăng ký: https://planetscale.com (dùng GitHub login)
2. Tạo Database mới
3. Lấy Connection String

**Tùy chọn B: Aiven MySQL (Free trial)**
1. Đăng ký: https://aiven.io
2. Tạo MySQL service

**Tùy chọn C: ClearDB MySQL (Free tier hạn chế)**
1. Tích hợp qua Heroku Add-on
2. Hoặc dùng trực tiếp

### Bước 2: Cấu Hình Environment Variables

Thêm vào Backend service trên Render:

```
DB_HOST=your-mysql-host
DB_PORT=3306
DB_NAME=menu_order_db
DB_USER=your-username
DB_PASSWORD=your-password
```

### Bước 3: Deploy

Code không cần thay đổi gì, chỉ cần set env vars và deploy lại.

---

## 📝 Checklist Sau Khi Setup

- [ ] Database đã được tạo trên Render/External service
- [ ] Environment variables đã được cấu hình đúng
- [ ] Database config file đã được cập nhật (nếu dùng PostgreSQL)
- [ ] Backend service đã link với database (nếu dùng Render PostgreSQL)
- [ ] Code đã được commit và push lên GitHub
- [ ] Deploy thành công, không có lỗi connection
- [ ] Test API endpoints hoạt động bình thường

---

## 🔧 Troubleshooting

### Lỗi: "Connection refused"
- ✅ Kiểm tra `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` đúng chưa
- ✅ Nếu dùng Render PostgreSQL, dùng **Internal Database URL** (không phải External)
- ✅ Kiểm tra database service đã running chưa

### Lỗi: "SSL required"
- ✅ Thêm `dialectOptions.ssl` như trong config ở trên (production)

### Lỗi: "Database does not exist"
- ✅ Kiểm tra tên database (`DB_NAME`) đúng chưa
- ✅ Tạo database trước nếu chưa có

---

## 📚 Tài Liệu Tham Khảo

- Render PostgreSQL Docs: https://render.com/docs/databases
- Sequelize PostgreSQL Setup: https://sequelize.org/docs/v6/getting-started/
- PlanetScale Free Tier: https://planetscale.com/pricing

