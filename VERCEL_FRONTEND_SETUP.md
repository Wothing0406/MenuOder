# 🔧 Cấu Hình Frontend trên Vercel

## ❌ Vấn Đề: Biểu Đồ Không Hiển Thị

Khi deploy frontend lên Vercel, các biểu đồ "Món Bán Chạy" và "Phân Loại Đơn Hàng" không hiển thị vì frontend không thể kết nối đến backend API.

## 🔍 Nguyên Nhân

1. **Environment Variable chưa được set**: `NEXT_PUBLIC_API_URL` chưa được cấu hình trên Vercel
2. **CORS issues**: Backend chưa cho phép domain Vercel
3. **API URL không đúng**: Frontend đang dùng localhost thay vì Render URL

## ✅ Cách Fix

### Bước 1: Set Environment Variable trên Vercel

1. Vào **Vercel Dashboard** → Chọn project của bạn
2. Vào **Settings** → **Environment Variables**
3. Thêm biến môi trường:

   **Name:**
   ```
   NEXT_PUBLIC_API_URL
   ```

   **Value:**
   ```
   https://your-backend-service.onrender.com/api
   ```
   
   **Lưu ý:** Thay `your-backend-service.onrender.com` bằng URL thực tế của backend trên Render

4. Chọn **Environment**: 
   - ✅ Production
   - ✅ Preview (nếu cần)
   - ✅ Development (nếu cần)

5. Click **Save**

### Bước 2: Cấu Hình CORS trên Backend (Render)

1. Vào **Render Dashboard** → **Services** → Chọn backend service
2. Vào tab **Environment**
3. Thêm hoặc cập nhật:

   ```
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

   **Lưu ý:** Thay `your-frontend.vercel.app` bằng domain Vercel thực tế của bạn

4. **Restart service** để áp dụng thay đổi

### Bước 3: Redeploy Frontend trên Vercel

Sau khi set environment variable:

1. Vào **Vercel Dashboard** → **Deployments**
2. Click **Redeploy** cho deployment mới nhất
3. Hoặc push code mới lên Git để trigger auto-deploy

### Bước 4: Kiểm Tra

Sau khi redeploy:

1. Mở **Browser Console** (F12)
2. Vào tab **Network**
3. Reload trang dashboard
4. Kiểm tra các request đến `/orders/my-store/top-items` và `/orders/my-store/order-type-stats`:
   - ✅ **200 OK**: API hoạt động tốt
   - ❌ **404/500**: Có lỗi từ backend
   - ❌ **CORS error**: CORS chưa được config đúng
   - ❌ **Network error**: API URL không đúng

## 🔍 Debug

### Kiểm Tra API URL

Trong browser console, chạy:
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

Hoặc check trong Network tab xem request đang gửi đến URL nào.

### Kiểm Tra CORS

Nếu thấy lỗi CORS trong console:
```
Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy
```

**Giải pháp:**
1. Kiểm tra `FRONTEND_URL` trên Render đã đúng chưa
2. Kiểm tra backend logs để xem có request nào bị block không
3. Đảm bảo domain Vercel được thêm vào `allowedOrigins` trong backend

### Kiểm Tra Authentication

Nếu API trả về 401 Unauthorized:
- Token có thể đã hết hạn
- Đăng nhập lại để lấy token mới

## 📋 Checklist

- [ ] `NEXT_PUBLIC_API_URL` đã được set trên Vercel
- [ ] `FRONTEND_URL` đã được set trên Render
- [ ] Frontend đã được redeploy sau khi set environment variable
- [ ] Backend đã được restart sau khi set `FRONTEND_URL`
- [ ] Browser console không có lỗi CORS
- [ ] Network requests trả về 200 OK
- [ ] Dữ liệu được hiển thị trong biểu đồ

## 🎯 Quick Fix

**Nếu vội, có thể test nhanh:**

1. **Tạm thời hardcode API URL** trong code (chỉ để test):
   ```javascript
   // frontend/lib/api.js
   let API_URL = 'https://your-backend.onrender.com/api';
   ```

2. **Redeploy** và test

3. **Sau đó** set environment variable đúng cách

## ⚠️ Lưu Ý

- `NEXT_PUBLIC_API_URL` phải có prefix `NEXT_PUBLIC_` để Next.js expose ra client-side
- URL phải là **full URL** với `https://` và không có trailing slash
- Sau khi set environment variable, **phải redeploy** frontend mới có hiệu lực
- CORS phải được config trên cả backend và frontend

---

**Sau khi fix, các biểu đồ sẽ hiển thị dữ liệu từ backend!**

