# ✅ Checklist Deploy Lên Render

## 📋 Trước Khi Deploy

### Backend Checklist

- [ ] Code đã được commit và push lên GitHub
- [ ] Đã cài đặt `pg` và `pg-hstore` trong `backend/package.json`
- [ ] Database config đã hỗ trợ PostgreSQL (`backend/src/config/database.js`)
- [ ] File `.env` đã được cấu hình đúng (hoặc sẽ set trên Render)
- [ ] Đã test chạy local thành công

### Frontend Checklist

- [ ] Code đã được commit và push lên GitHub
- [ ] `next.config.js` đã được cập nhật để hỗ trợ production
- [ ] Environment variables đã được chuẩn bị

---

## 🗄️ Bước 1: Tạo PostgreSQL Database trên Render

1. [ ] Vào https://dashboard.render.com
2. [ ] Click **"New +"** → Chọn **"PostgreSQL"**
3. [ ] Điền thông tin:
   - **Name**: `menuorder-db`
   - **Database**: `menu_order_db`
   - **Region**: Singapore (hoặc gần nhất)
   - **PostgreSQL Version**: 15
   - **Plan**: **Free**
4. [ ] Click **"Create Database"**
5. [ ] Chờ database được tạo (khoảng 2-3 phút)

---

## 🔧 Bước 2: Tạo Backend Service trên Render

1. [ ] Click **"New +"** → Chọn **"Web Service"**
2. [ ] Kết nối với GitHub repository
3. [ ] Cấu hình:
   - **Name**: `menuorder-backend`
   - **Root Directory**: `/backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start`
4. [ ] **Link Database**:
   - Tìm phần **"Connections"** hoặc **"Services"**
   - Click **"Link Database"** → Chọn PostgreSQL service (`menuorder-db`)
   - Render sẽ tự động thêm `DATABASE_URL` vào Environment Variables
5. [ ] Thêm các Environment Variables còn lại:
   ```
   NODE_ENV=production
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=24h
   FRONTEND_URL=https://your-frontend.onrender.com
   UPLOAD_PATH=./uploads
   ```
6. [ ] Click **"Create Web Service"**
7. [ ] Chờ deploy xong (khoảng 5-10 phút)
8. [ ] Copy URL của backend (ví dụ: `https://menuorder-backend.onrender.com`)

---

## 🎨 Bước 3: Tạo Frontend Service trên Render

1. [ ] Click **"New +"** → Chọn **"Web Service"**
2. [ ] Kết nối với GitHub repository (cùng repo)
3. [ ] Cấu hình:
   - **Name**: `menuorder-frontend`
   - **Root Directory**: `/frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
4. [ ] Thêm Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://menuorder-backend.onrender.com/api
   NEXT_PUBLIC_APP_URL=https://menuorder-frontend.onrender.com
   NODE_ENV=production
   ```
   > ⚠️ **Lưu ý**: Thay `menuorder-backend.onrender.com` bằng URL backend thực tế của bạn
5. [ ] Click **"Create Web Service"**
6. [ ] Chờ deploy xong (khoảng 5-10 phút)
7. [ ] Copy URL của frontend

---

## 🔗 Bước 4: Cập Nhật Environment Variables

### Cập Nhật Backend

1. [ ] Vào Backend Service → **Environment**
2. [ ] Cập nhật `FRONTEND_URL` thành URL frontend thực tế:
   ```
   FRONTEND_URL=https://menuorder-frontend.onrender.com
   ```
3. [ ] Save changes → Render sẽ tự động deploy lại

### Cập Nhật Frontend (nếu cần)

1. [ ] Vào Frontend Service → **Environment**
2. [ ] Kiểm tra `NEXT_PUBLIC_API_URL` đúng chưa
3. [ ] Save changes → Render sẽ tự động deploy lại

---

## ✅ Bước 5: Kiểm Tra Deployment

### Kiểm Tra Backend

1. [ ] Vào Backend Service → **Logs**
2. [ ] Kiểm tra có thông báo:
   - ✅ `Database connection established successfully`
   - ✅ `Database synchronized successfully`
   - ✅ `Server running on port XXXX`
3. [ ] Test API endpoint: `https://your-backend.onrender.com/api`
   - Nếu thấy `{"success":false,"message":"Route not found"}` → Backend đã chạy!

### Kiểm Tra Frontend

1. [ ] Vào Frontend Service → **Logs**
2. [ ] Kiểm tra không có lỗi build
3. [ ] Mở URL frontend trong browser
4. [ ] Test đăng ký/đăng nhập
5. [ ] Test xem menu, đặt hàng

---

## 🐛 Troubleshooting

### Backend không kết nối được database

**Nguyên nhân**: `DATABASE_URL` chưa được set hoặc sai

**Giải pháp**:
1. Vào Backend Service → **Environment**
2. Kiểm tra `DATABASE_URL` có tồn tại không
3. Nếu chưa có, vào PostgreSQL service → **Connections** → Copy **Internal Database URL**
4. Paste vào Backend Service Environment Variables

### Frontend không kết nối được backend

**Nguyên nhân**: `NEXT_PUBLIC_API_URL` sai hoặc CORS issue

**Giải pháp**:
1. Kiểm tra `NEXT_PUBLIC_API_URL` trong Frontend Environment Variables
2. Kiểm tra `FRONTEND_URL` trong Backend Environment Variables
3. Đảm bảo URL đúng format: `https://your-backend.onrender.com/api` (không có dấu `/` cuối)

### Lỗi build frontend

**Nguyên nhân**: Thiếu dependencies hoặc lỗi syntax

**Giải pháp**:
1. Kiểm tra logs để xem lỗi cụ thể
2. Test build local: `cd frontend && npm run build`
3. Fix lỗi và commit lại

---

## 🎉 Hoàn Tất!

Sau khi làm xong tất cả các bước trên, website của bạn đã sẵn sàng để sử dụng!

**URL truy cập**:
- Frontend: `https://menuorder-frontend.onrender.com`
- Backend API: `https://menuorder-backend.onrender.com/api`

---

## 📚 Tài Liệu Tham Khảo

- [Render Database Setup](./RENDER_DATABASE_SETUP.md)
- [Render Quick Setup](./RENDER_QUICK_SETUP.md)
- [Render Documentation](https://render.com/docs)

