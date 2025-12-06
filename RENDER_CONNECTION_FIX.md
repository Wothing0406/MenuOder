# 🔧 Fix Lỗi Connection Refused trên Render

## ❌ Lỗi: `ECONNREFUSED 10.224.85.13:5432`

Lỗi này xảy ra khi service không thể kết nối đến database PostgreSQL trên Render.

## 🔍 Nguyên Nhân

1. **Database chưa được link với service**
2. **Database chưa sẵn sàng** (đang khởi động)
3. **Connection string không đúng**
4. **Database bị dừng hoặc lỗi**

## ✅ Cách Fix

### Bước 1: Kiểm Tra Database Status

1. Vào **Render Dashboard** → **Databases**
2. Tìm database PostgreSQL của bạn
3. Đảm bảo trạng thái là **"Running"** (màu xanh)
4. Nếu là **"Provisioning"** hoặc **"Paused"**, đợi hoặc resume database

### Bước 2: Link Database Với Service (QUAN TRỌNG!)

**Đây là bước quan trọng nhất!**

1. Vào **Render Dashboard** → **Services**
2. Chọn **service backend** của bạn
3. Scroll xuống phần **"Connections"** (hoặc tab **"Connections"**)
4. Click **"Link Database"** hoặc **"Connect"**
5. Chọn database PostgreSQL của bạn từ dropdown
6. Click **"Link"** hoặc **"Connect"**

**Sau khi link:**
- Render sẽ tự động thêm biến `DATABASE_URL` vào environment variables
- Connection string sẽ là Internal Database URL (nhanh và an toàn hơn)

### Bước 3: Kiểm Tra Environment Variables

1. Vào tab **Environment** của service
2. Kiểm tra xem có biến `DATABASE_URL` không
3. Nếu có, đảm bảo nó trỏ đến đúng database
4. Đảm bảo có `NODE_ENV=production`

**Nếu không có `DATABASE_URL`:**
- Thêm thủ công connection string từ database:
  ```
  DATABASE_URL=postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a/menu_order_db_wfa4
  ```

### Bước 4: Restart Service

1. Vào tab **Events** hoặc **Logs**
2. Click **"Restart"** hoặc **"Manual Deploy"**
3. Đợi service khởi động lại
4. Kiểm tra logs để xem có kết nối thành công không

### Bước 5: Kiểm Tra Logs

Sau khi restart, tìm trong logs:

**✅ Thành công:**
```
✅ Database connection established
✅ Database synchronized successfully
🚀 Server running on port...
```

**❌ Vẫn lỗi:**
- Xem phần Troubleshooting bên dưới

## 🔍 Troubleshooting Chi Tiết

### Vấn Đề 1: Database Chưa Sẵn Sàng

**Triệu chứng:**
- Database status là "Provisioning"
- Hoặc vừa mới tạo database

**Giải pháp:**
- Đợi 2-5 phút để database khởi động hoàn toàn
- Kiểm tra lại status trong Dashboard
- Thử restart service sau khi database đã "Running"

### Vấn Đề 2: Database Không Được Link

**Triệu chứng:**
- Không có `DATABASE_URL` trong environment variables
- Hoặc `DATABASE_URL` trỏ đến database khác

**Giải pháp:**
1. Link database như Bước 2 ở trên
2. Hoặc thêm `DATABASE_URL` thủ công từ database page:
   - Vào Database → Copy **Internal Database URL** hoặc **External Connection String**
   - Thêm vào Environment Variables

### Vấn Đề 3: Connection String Sai

**Triệu chứng:**
- Có `DATABASE_URL` nhưng vẫn lỗi connection

**Giải pháp:**
1. Vào Database page
2. Copy lại connection string mới nhất
3. Cập nhật `DATABASE_URL` trong Environment Variables
4. Restart service

### Vấn Đề 4: Database Bị Paused

**Triệu chứng:**
- Database status là "Paused"
- Free tier database có thể bị pause sau 90 ngày không dùng

**Giải pháp:**
1. Vào Database page
2. Click **"Resume"** hoặc **"Start"**
3. Đợi database khởi động lại
4. Restart service

### Vấn Đề 5: Service Không Có Quyền Truy Cập

**Triệu chứng:**
- Database đang running nhưng vẫn connection refused

**Giải pháp:**
1. Unlink database (nếu đã link)
2. Link lại database
3. Đảm bảo service và database ở cùng một account/team

## 📋 Checklist

- [ ] Database status là "Running"
- [ ] Database đã được link với service
- [ ] `DATABASE_URL` có trong Environment Variables
- [ ] `NODE_ENV=production` được set
- [ ] Service đã được restart sau khi thay đổi
- [ ] Logs không còn lỗi connection

## 🎯 Quick Fix (Nếu Vội)

1. **Unlink database** (nếu đã link)
2. **Link lại database** với service
3. **Restart service**
4. **Kiểm tra logs**

Nếu vẫn không được, thử:
1. **Copy External Connection String** từ database
2. **Thêm vào Environment Variables** thủ công
3. **Restart service**

## 💡 Lưu Ý

- **Internal Database URL** (10.x.x.x) chỉ hoạt động khi database được **link** với service
- **External Connection String** có thể dùng từ bất kỳ đâu nhưng cần whitelist IP (nếu cần)
- Render tự động thêm `DATABASE_URL` khi link database
- Nếu unlink database, cần thêm `DATABASE_URL` thủ công

---

**Sau khi fix, service sẽ tự động retry kết nối 5 lần với exponential backoff.**

