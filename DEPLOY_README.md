# 🚀 Hướng Dẫn Deploy MenuOrder Lên Render

## 📋 Tổng Quan

Dự án này đã được cấu hình để deploy lên Render.com với:
- ✅ Backend: Node.js/Express với PostgreSQL
- ✅ Frontend: Next.js 14
- ✅ Database: PostgreSQL (Render Managed Database)

---

## ⚡ Quick Start (3 Bước)

### 1. Tạo PostgreSQL Database

1. Vào https://dashboard.render.com
2. Click **"New +"** → Chọn **"PostgreSQL"**
3. Điền thông tin và chọn plan **Free**
4. Click **"Create Database"**

### 2. Deploy Backend

1. Click **"New +"** → Chọn **"Web Service"**
2. Kết nối GitHub repository
3. Cấu hình:
   - **Root Directory**: `/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start`
4. **Link Database** với PostgreSQL service vừa tạo
5. Thêm Environment Variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=24h
   FRONTEND_URL=https://your-frontend.onrender.com
   ```
6. Copy URL backend (ví dụ: `https://menuorder-backend.onrender.com`)

### 3. Deploy Frontend

1. Click **"New +"** → Chọn **"Web Service"**
2. Kết nối GitHub repository (cùng repo)
3. Cấu hình:
   - **Root Directory**: `/frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
4. Thêm Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://menuorder-backend.onrender.com/api
   NEXT_PUBLIC_APP_URL=https://menuorder-frontend.onrender.com
   NODE_ENV=production
   ```
5. Cập nhật `FRONTEND_URL` trong Backend service = URL frontend

---

## ✅ Checklist Đầy Đủ

Xem file: [docs/DEPLOY_CHECKLIST.md](./docs/DEPLOY_CHECKLIST.md)

---

## 🔧 Environment Variables

### Backend (Render)

| Biến | Giá Trị | Mô Tả |
|------|---------|-------|
| `DATABASE_URL` | Tự động | Tự động thêm khi link database |
| `NODE_ENV` | `production` | Environment |
| `JWT_SECRET` | Random string | Secret key cho JWT |
| `JWT_EXPIRE` | `24h` | Thời gian hết hạn JWT |
| `FRONTEND_URL` | URL frontend | URL frontend để CORS |
| `PORT` | Tự động | Port tự động set bởi Render |

### Frontend (Render)

| Biến | Giá Trị | Mô Tả |
|------|---------|-------|
| `NEXT_PUBLIC_API_URL` | URL backend + `/api` | URL API backend |
| `NEXT_PUBLIC_APP_URL` | URL frontend | URL frontend |
| `NODE_ENV` | `production` | Environment |

---

## 📝 Lưu Ý Quan Trọng

### 1. Database Connection

- ✅ Render tự động set `DATABASE_URL` khi link database
- ✅ Code tự động phát hiện PostgreSQL qua `DATABASE_URL`
- ✅ SSL được tự động bật trong production

### 2. CORS Configuration

- ✅ Backend đã cấu hình CORS để cho phép frontend
- ✅ Đảm bảo `FRONTEND_URL` trong backend = URL frontend thực tế

### 3. Build Commands

**Backend**:
- Build: `npm install`
- Start: `npm run start`

**Frontend**:
- Build: `npm install && npm run build`
- Start: `npm run start`

### 4. Root Directory

- **Backend**: `/backend`
- **Frontend**: `/frontend`

---

## 🐛 Troubleshooting

### Backend không kết nối được database

**Giải pháp**:
1. Vào Backend Service → Environment
2. Kiểm tra `DATABASE_URL` có tồn tại không
3. Nếu chưa có, vào PostgreSQL service → Connections → Copy Internal Database URL
4. Paste vào Backend Environment Variables

### Frontend không load được API

**Giải pháp**:
1. Kiểm tra `NEXT_PUBLIC_API_URL` trong Frontend Environment Variables
2. Đảm bảo URL đúng format: `https://your-backend.onrender.com/api`
3. Kiểm tra `FRONTEND_URL` trong Backend Environment Variables

### Lỗi build frontend

**Giải pháp**:
1. Kiểm tra logs để xem lỗi cụ thể
2. Test build local: `cd frontend && npm run build`
3. Đảm bảo tất cả dependencies đã được cài đặt

---

## 📚 Tài Liệu Chi Tiết

- [Deploy Checklist](./docs/DEPLOY_CHECKLIST.md) - Checklist đầy đủ
- [Render Database Setup](./docs/RENDER_DATABASE_SETUP.md) - Hướng dẫn setup database
- [Render Quick Setup](./docs/RENDER_QUICK_SETUP.md) - Hướng dẫn nhanh
- [Changes Summary](./CHANGES_SUMMARY.md) - Tóm tắt các thay đổi

---

## 🎉 Sau Khi Deploy Thành Công

1. ✅ Test đăng ký/đăng nhập
2. ✅ Test tạo cửa hàng
3. ✅ Test thêm menu
4. ✅ Test đặt hàng từ frontend
5. ✅ Kiểm tra dashboard quản lý đơn hàng

---

## 💡 Tips

- **Free tier của Render**: 512 MB RAM, 1 GB storage - đủ cho dự án nhỏ
- **Sleep mode**: Free tier sẽ sleep sau 15 phút không có request
- **Custom domain**: Render hỗ trợ thêm custom domain miễn phí
- **Auto-deploy**: Render tự động deploy khi push code lên GitHub

---

**Good luck with your deployment! 🚀**

