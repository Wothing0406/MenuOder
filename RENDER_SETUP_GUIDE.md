# 🚀 Hướng Dẫn Cấu Hình Render Sau Khi Migration

Sau khi đã migration dữ liệu sang database PostgreSQL trên Render, bạn cần cấu hình service backend trên Render để sử dụng database mới.

## ✅ Checklist Trước Khi Làm Trên Render

- [ ] Đã backup database cũ
- [ ] Đã chạy script migration thành công
- [ ] Đã kiểm tra dữ liệu trên database mới
- [ ] Đã test ứng dụng local với database mới

## 📋 Các Bước Trên Render

### Bước 1: Kiểm Tra PostgreSQL Database

1. Vào **Render Dashboard** → **Databases**
2. Tìm database `menu_order_db_wfa4` (hoặc tên database của bạn)
3. Đảm bảo database đang **Running** (trạng thái xanh)
4. Copy **Internal Database URL** hoặc **External Connection String** nếu cần

### Bước 2: Cấu Hình Environment Variables Cho Backend Service

1. Vào **Render Dashboard** → **Services** → Chọn service backend của bạn

2. Vào tab **Environment**

3. **Thêm hoặc cập nhật** các biến môi trường sau:

   ```env
   # Database Configuration
   DATABASE_URL=postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a/menu_order_db_wfa4
   
   # Hoặc nếu Render tự động link database, có thể dùng:
   # DATABASE_URL sẽ tự động được set khi link database
   
   # Environment
   NODE_ENV=production
   
   # Backend URL (nếu cần)
   BACKEND_URL=https://your-backend-service.onrender.com
   
   # Frontend URL (nếu cần)
   FRONTEND_URL=https://your-frontend-service.onrender.com
   
   # Các biến môi trường khác (JWT_SECRET, CLOUDINARY, etc.)
   JWT_SECRET=your_jwt_secret_here
   # ... các biến khác
   ```

4. **Lưu ý quan trọng:**
   - Nếu bạn đã **link database** với service, Render sẽ tự động tạo biến `DATABASE_URL`
   - Bạn có thể **xóa** các biến cũ như `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` nếu không dùng nữa
   - Đảm bảo **NODE_ENV=production** để kích hoạt SSL cho PostgreSQL

### Bước 3: Link Database Với Service (Nếu Chưa Link)

**Cách 1: Tự động link (Khuyến nghị)**

1. Trong trang service backend, scroll xuống phần **Connections**
2. Click **Link Database**
3. Chọn database PostgreSQL của bạn
4. Render sẽ tự động thêm biến `DATABASE_URL` vào environment variables

**Cách 2: Thủ công**

1. Copy connection string từ database
2. Thêm vào environment variables như Bước 2

### Bước 4: Kiểm Tra Build Settings (Nếu Cần)

1. Vào tab **Settings** của service
2. Kiểm tra:
   - **Build Command**: `cd backend && npm install && npm run build` (nếu có)
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Để trống hoặc set `backend` nếu code ở thư mục backend

### Bước 5: Deploy/Manual Deploy

**Nếu đã có auto-deploy từ Git:**
- Push code mới lên Git (nếu có thay đổi)
- Render sẽ tự động deploy

**Nếu muốn deploy thủ công:**
1. Vào tab **Manual Deploy**
2. Click **Deploy latest commit**

### Bước 6: Kiểm Tra Logs

1. Vào tab **Logs** của service
2. Kiểm tra xem có lỗi không
3. Tìm các dòng log quan trọng:
   ```
   ✅ Database connection established
   ✅ Database synchronized successfully
   🚀 Server running on port 5000
   ```

### Bước 7: Test Service

1. Sau khi deploy xong, kiểm tra service hoạt động:
   ```bash
   # Test health check (nếu có)
   curl https://your-backend-service.onrender.com/api/health
   
   # Hoặc test endpoint bất kỳ
   curl https://your-backend-service.onrender.com/api/stores
   ```

2. Kiểm tra database connection:
   - Xem logs để đảm bảo không có lỗi kết nối database
   - Test các API endpoints để đảm bảo dữ liệu được load đúng

## ⚠️ Lưu Ý Quan Trọng

### 1. Database Connection

- Render PostgreSQL yêu cầu **SSL connection** trong production
- Code đã tự động xử lý SSL khi `NODE_ENV=production`
- Đảm bảo `NODE_ENV=production` được set

### 2. Environment Variables

- **KHÔNG commit** `.env` file lên Git
- Tất cả biến môi trường phải được set trên Render Dashboard
- Nếu có thay đổi environment variables, cần **restart service**

### 3. Service Restart

Sau khi thay đổi environment variables:
1. Vào tab **Events** hoặc **Logs**
2. Click **Restart** hoặc đợi auto-restart
3. Kiểm tra logs để đảm bảo service khởi động thành công

### 4. Database Access

- **Internal Database URL**: Chỉ dùng trong Render network (nhanh hơn, an toàn hơn)
- **External Connection String**: Dùng từ bên ngoài Render (chậm hơn, cần whitelist IP)

## 🔍 Troubleshooting

### Lỗi: "Connection refused" hoặc "Connection timeout"

**Nguyên nhân:**
- Database chưa được link với service
- Connection string sai
- Database chưa sẵn sàng

**Giải pháp:**
1. Kiểm tra database đang **Running**
2. Kiểm tra `DATABASE_URL` trong environment variables
3. Thử link database lại
4. Restart service

### Lỗi: "SSL required"

**Nguyên nhân:**
- `NODE_ENV` chưa được set là `production`
- SSL config chưa đúng

**Giải pháp:**
1. Set `NODE_ENV=production` trong environment variables
2. Restart service

### Lỗi: "Table does not exist"

**Nguyên nhân:**
- Schema chưa được sync trên database mới

**Giải pháp:**
1. Service sẽ tự động sync schema khi khởi động (với `alter: false`)
2. Nếu cần thêm cột mới, có thể cần chạy migration script từ local
3. Hoặc tạm thời set `alter: true` trong code (cẩn thận!)

### Service không khởi động

**Kiểm tra:**
1. Logs để xem lỗi cụ thể
2. Environment variables đã đúng chưa
3. Build command và start command đúng chưa
4. Dependencies đã được install chưa

## ✅ Checklist Sau Khi Cấu Hình

- [ ] Database đã được link với service
- [ ] Environment variables đã được set đúng
- [ ] Service đã deploy thành công
- [ ] Logs không có lỗi
- [ ] API endpoints hoạt động bình thường
- [ ] Dữ liệu được load đúng từ database mới
- [ ] Đã test các tính năng chính (login, CRUD, etc.)

## 🎯 Tóm Tắt

**Những gì cần làm trên Render:**

1. ✅ **Kiểm tra database** đang running
2. ✅ **Link database** với service (hoặc set DATABASE_URL thủ công)
3. ✅ **Set environment variables** (DATABASE_URL, NODE_ENV, etc.)
4. ✅ **Deploy/Restart service**
5. ✅ **Kiểm tra logs** và test service

**Sau đó:**
- Service sẽ tự động kết nối với database mới
- Schema sẽ được sync tự động (nếu cần)
- Dữ liệu đã được migration sẽ được sử dụng

---

**Chúc bạn deploy thành công! 🎉**



