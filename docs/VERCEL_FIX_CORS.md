# 🔧 Sửa Lỗi CORS và API Khi Deploy Lên Vercel

## ❌ Vấn Đề

Khi deploy frontend lên Vercel, gặp các lỗi:
1. ❌ Không thể gọi API từ Render backend
2. ❌ Không thể đăng ký/xác nhận địa chỉ
3. ❌ CORS error trong browser console

---

## ✅ Giải Pháp

### Bước 1: Sửa CORS Trên Backend (Render)

#### 1.1. Vào Render Dashboard
1. Truy cập: https://dashboard.render.com
2. Chọn **Backend Service**
3. Vào **Environment** tab

#### 1.2. Thêm/Cập Nhật Environment Variable

Thêm hoặc cập nhật biến `FRONTEND_URL`:

```
FRONTEND_URL=https://your-app.vercel.app,https://your-app-git-main.vercel.app
```

**Lưu ý:**
- Thay `your-app.vercel.app` bằng URL Vercel thực tế của bạn
- Có thể thêm nhiều URLs, cách nhau bằng dấu phẩy
- Bao gồm cả preview URLs nếu muốn test PRs

**Ví dụ:**
```
FRONTEND_URL=https://menuorder.vercel.app,https://menuorder-git-main.vercel.app,http://localhost:3000
```

#### 1.3. Redeploy Backend
1. Vào **Manual Deploy** → **Deploy latest commit**
2. Chờ deploy xong (2-5 phút)

---

### Bước 2: Cấu Hình Environment Variables Trên Vercel

#### 2.1. Vào Vercel Dashboard
1. Truy cập: https://vercel.com
2. Chọn **Project** của bạn
3. Vào **Settings** → **Environment Variables**

#### 2.2. Thêm/Cập Nhật Biến

**Biến 1: API URL**
```
Name: NEXT_PUBLIC_API_URL
Value: https://your-backend.onrender.com/api
```
**Lưu ý:** Thay `your-backend.onrender.com` bằng URL backend Render thực tế

**Biến 2: Node Environment**
```
Name: NODE_ENV
Value: production
```

**Biến 3: App URL (Optional)**
```
Name: NEXT_PUBLIC_APP_URL
Value: https://your-app.vercel.app
```

#### 2.3. Chọn Environment
- ✅ **Production** (bắt buộc)
- ✅ **Preview** (khuyến nghị)
- ✅ **Development** (optional)

#### 2.4. Redeploy
1. Vào **Deployments**
2. Click **"..."** → **"Redeploy"**
3. Hoặc push code mới lên GitHub

---

## 🔍 Kiểm Tra

### 1. Kiểm Tra CORS

Mở Browser Console (F12) và kiểm tra:
- ✅ Không có lỗi CORS
- ✅ API calls thành công
- ✅ Network tab hiển thị requests 200 OK

### 2. Test Đăng Ký

1. Vào trang đăng ký: `https://your-app.vercel.app/register`
2. Điền thông tin
3. Nhập địa chỉ và chờ xác thực
4. Xác nhận địa chỉ
5. Submit form

**Nếu vẫn lỗi:**
- Kiểm tra Console để xem lỗi cụ thể
- Kiểm tra Network tab để xem API response
- Kiểm tra backend logs trên Render

---

## 🐛 Troubleshooting

### Lỗi: "CORS policy: No 'Access-Control-Allow-Origin'"

**Nguyên nhân:**
- Backend chưa cho phép Vercel domain
- `FRONTEND_URL` chưa được set đúng

**Giải pháp:**
1. Kiểm tra `FRONTEND_URL` trên Render có đúng không
2. Đảm bảo URL Vercel đã được thêm vào
3. Redeploy backend sau khi sửa

### Lỗi: "Network Error" hoặc "Failed to fetch"

**Nguyên nhân:**
- `NEXT_PUBLIC_API_URL` chưa set hoặc sai
- Backend không chạy

**Giải pháp:**
1. Kiểm tra `NEXT_PUBLIC_API_URL` trên Vercel
2. Test backend URL trực tiếp: `https://your-backend.onrender.com/api/health`
3. Kiểm tra backend đang chạy trên Render

### Lỗi: "Cannot validate address"

**Nguyên nhân:**
- API `/orders/validate-address` không hoạt động
- Backend chưa có route này

**Giải pháp:**
1. Kiểm tra backend có route `/api/orders/validate-address` không
2. Test API bằng Postman/curl
3. Xem backend logs để tìm lỗi

### Lỗi: "Address not confirmed"

**Nguyên nhân:**
- Form yêu cầu xác nhận địa chỉ trước khi submit
- User chưa click "Xác nhận địa chỉ"

**Giải pháp:**
- Đây là tính năng bảo vệ, user phải:
  1. Nhập địa chỉ
  2. Chờ hệ thống xác thực
  3. Click "✓ Xác nhận địa chỉ này"
  4. Sau đó mới submit được

---

## 📝 Checklist

- [ ] Backend `FRONTEND_URL` đã set với Vercel URL
- [ ] Vercel `NEXT_PUBLIC_API_URL` đã set với Render backend URL
- [ ] Backend đã redeploy sau khi sửa CORS
- [ ] Frontend đã redeploy sau khi set env vars
- [ ] Test đăng ký thành công
- [ ] Test xác thực địa chỉ hoạt động
- [ ] Không có lỗi CORS trong console

---

## 🎯 Quick Fix

Nếu cần fix nhanh:

1. **Backend (Render):**
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
   → Redeploy

2. **Frontend (Vercel):**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
   ```
   → Redeploy

3. **Test:**
   - Mở app trên Vercel
   - Thử đăng ký
   - Kiểm tra console không có lỗi

---

## 💡 Tips

1. **Preview Deployments:**
   - Mỗi PR có URL riêng
   - Cần thêm preview URL vào `FRONTEND_URL` nếu muốn test PRs
   - Hoặc dùng wildcard `*.vercel.app` (đã được code tự động cho phép)

2. **Multiple Environments:**
   ```
   FRONTEND_URL=https://app.vercel.app,https://staging.vercel.app,http://localhost:3000
   ```

3. **Debug:**
   - Luôn kiểm tra browser console
   - Xem Network tab để debug API calls
   - Check backend logs trên Render

---

**Sau khi fix xong, app sẽ hoạt động bình thường! 🎉**


