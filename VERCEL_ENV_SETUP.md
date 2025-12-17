# 🔧 Hướng Dẫn Cấu Hình Environment Variables trên Vercel

## ⚠️ QUAN TRỌNG: Vấn đề Dashboard không hiển thị dữ liệu

Nếu dashboard hiển thị 0 cho tất cả thống kê, **nguyên nhân chính** là thiếu biến môi trường `NEXT_PUBLIC_API_URL` trên Vercel.

## 📋 Các Bước Cấu Hình

### 1. Vào Vercel Dashboard

1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project của bạn
3. Vào **Settings** → **Environment Variables**

### 2. Thêm Environment Variables

Thêm các biến sau (thay `your-backend-url.onrender.com` bằng URL backend thực tế của bạn):

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
```

**Lưu ý quan trọng:**
- ✅ URL phải bắt đầu bằng `https://` (không dùng `http://`)
- ✅ URL phải kết thúc bằng `/api` (hoặc code sẽ tự động thêm)
- ✅ Không có dấu `/` ở cuối sau `/api`
- ✅ Phải có prefix `NEXT_PUBLIC_` để Next.js expose ra client-side

### 3. Ví dụ Cấu Hình Đúng

```env
# ✅ ĐÚNG
NEXT_PUBLIC_API_URL=https://menu-order-backend.onrender.com/api

# ✅ CŨNG ĐÚNG (code sẽ tự thêm /api)
NEXT_PUBLIC_API_URL=https://menu-order-backend.onrender.com

# ❌ SAI - thiếu https
NEXT_PUBLIC_API_URL=http://menu-order-backend.onrender.com/api

# ❌ SAI - có dấu / thừa
NEXT_PUBLIC_API_URL=https://menu-order-backend.onrender.com/api/

# ❌ SAI - thiếu NEXT_PUBLIC_ prefix
API_URL=https://menu-order-backend.onrender.com/api
```

### 4. Chọn Environment

Khi thêm biến, chọn các môi trường áp dụng:
- ✅ **Production** (bắt buộc)
- ✅ **Preview** (khuyến nghị)
- ✅ **Development** (tùy chọn, thường dùng local)

### 5. Redeploy

Sau khi thêm/sửa environment variables:
1. Vào tab **Deployments**
2. Click vào deployment mới nhất
3. Click **Redeploy** (hoặc push code mới lên GitHub để tự động deploy)

## 🔍 Kiểm Tra Cấu Hình

### Cách 1: Kiểm tra trong Browser Console

1. Mở website trên Vercel
2. Mở Developer Tools (F12)
3. Vào tab **Console**
4. Tìm dòng: `🔗 API Base URL: ...`
5. Kiểm tra URL có đúng không

**Nếu thấy:**
- `http://localhost:5002/api` → ❌ Chưa set environment variable
- `https://your-backend.onrender.com/api` → ✅ Đúng

### Cách 2: Kiểm tra trong Network Tab

1. Mở Developer Tools (F12)
2. Vào tab **Network**
3. Thử load dashboard
4. Xem request đầu tiên, kiểm tra URL trong Request URL

### Cách 3: Kiểm tra Error Message

Nếu có lỗi, console sẽ hiển thị:
```
⚠️ WARNING: API URL đang trỏ đến localhost trong production!
Vui lòng set NEXT_PUBLIC_API_URL trong Vercel Environment Variables
Current API URL: http://localhost:5002/api
```

## 🐛 Troubleshooting

### Vấn đề: Dashboard vẫn hiển thị 0

**Nguyên nhân có thể:**
1. ❌ Chưa set `NEXT_PUBLIC_API_URL` trên Vercel
2. ❌ URL backend sai hoặc không accessible
3. ❌ Backend chưa chạy hoặc bị lỗi
4. ❌ Database chưa có dữ liệu (chưa có đơn hàng completed)

**Cách fix:**
1. Kiểm tra environment variable trên Vercel
2. Test backend API trực tiếp: `https://your-backend.onrender.com/api/health`
3. Kiểm tra logs trên Render để xem backend có lỗi không
4. Kiểm tra database có đơn hàng với status = 'completed' không

### Vấn đề: CORS Error

Nếu thấy lỗi CORS, đảm bảo backend đã cấu hình CORS đúng:

```javascript
// backend/src/index.js
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

### Vấn đề: 401 Unauthorized

Nếu thấy lỗi 401:
1. Kiểm tra token có được lưu trong localStorage không
2. Kiểm tra token có hết hạn không
3. Thử đăng nhập lại

## 📝 Checklist

Trước khi deploy, đảm bảo:

- [ ] `NEXT_PUBLIC_API_URL` đã được set trên Vercel
- [ ] URL backend đúng và accessible
- [ ] Backend đã deploy và chạy ổn định trên Render
- [ ] Database đã được migrate và có dữ liệu
- [ ] CORS đã được cấu hình đúng trên backend
- [ ] Đã redeploy sau khi thêm environment variables

## 🔗 Liên Kết Hữu Ích

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

