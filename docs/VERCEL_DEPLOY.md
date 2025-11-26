# 🚀 Hướng Dẫn Deploy Frontend Lên Vercel

## 📋 Chuẩn Bị

Trước khi deploy, đảm bảo:
- ✅ Code đã được push lên GitHub
- ✅ Frontend có thể build thành công local
- ✅ Đã có URL backend (Render, Railway, hoặc server khác)

---

## 🎯 Bước 1: Đăng Ký Vercel

1. Truy cập: **https://vercel.com**
2. Click **"Sign Up"** hoặc **"Log In"**
3. Chọn **"Continue with GitHub"**
4. Authorize Vercel truy cập GitHub repositories

---

## 🎯 Bước 2: Import Project

1. Sau khi đăng nhập, vào **Dashboard**
2. Click **"Add New..."** → **"Project"**
3. Tìm và chọn repository **MenuOder** (hoặc tên repo của bạn)
4. Click **"Import"**

---

## 🎯 Bước 3: Cấu Hình Project

### 3.1. Framework Preset
- Vercel sẽ tự động detect **Next.js** ✅
- Không cần thay đổi

### 3.2. Root Directory ⚠️ QUAN TRỌNG
- Click **"Edit"** hoặc **"Configure Project"**
- Set **Root Directory**: `frontend`
- Vì frontend code nằm trong folder `frontend/`

### 3.3. Build Settings
Vercel sẽ tự động detect:
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅
- **Install Command**: `npm install` ✅

**Nếu không tự động, set thủ công:**
```
Build Command: cd frontend && npm run build
Output Directory: frontend/.next
Install Command: cd frontend && npm install
```

---

## 🎯 Bước 4: Environment Variables

### Thêm các biến môi trường:

1. Scroll xuống phần **"Environment Variables"**
2. Click **"Add"** và thêm từng biến:

#### Biến 1: API URL
```
Name: NEXT_PUBLIC_API_URL
Value: https://your-backend.onrender.com/api
```
**Lưu ý:** Thay `your-backend.onrender.com` bằng URL backend thực tế của bạn

#### Biến 2: App URL (Optional)
```
Name: NEXT_PUBLIC_APP_URL
Value: https://your-app.vercel.app
```
**Lưu ý:** Sẽ được set tự động sau khi deploy, có thể để trống lần đầu

#### Biến 3: Node Environment
```
Name: NODE_ENV
Value: production
```

### Chọn Environment:
- ✅ **Production** (bắt buộc)
- ✅ **Preview** (khuyến nghị)
- ✅ **Development** (optional)

---

## 🎯 Bước 5: Deploy

1. Click **"Deploy"** ở góc dưới bên phải
2. Chờ quá trình build (2-5 phút)
3. Xem progress trong real-time

---

## 🎯 Bước 6: Kiểm Tra Deploy

### Sau khi deploy xong:

1. **Xem URL**: Vercel sẽ cung cấp URL như:
   ```
   https://menuorder-xxxxx.vercel.app
   ```

2. **Kiểm tra Logs**:
   - Click vào deployment
   - Xem tab **"Logs"** để kiểm tra lỗi (nếu có)

3. **Test App**:
   - Mở URL trong browser
   - Kiểm tra các trang chính
   - Test API calls

---

## ⚙️ Cấu Hình Sau Deploy

### 1. Custom Domain (Optional)

1. Vào Project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Nhập domain của bạn (ví dụ: `menuorder.com`)
4. Follow instructions để setup DNS:
   - Thêm CNAME record: `@` → `cname.vercel-dns.com`
   - Hoặc A record theo hướng dẫn

### 2. Update Environment Variables

Nếu cần thay đổi:
1. Vào Project → **Settings** → **Environment Variables**
2. Edit hoặc thêm biến mới
3. **Redeploy** để áp dụng thay đổi

### 3. Auto-Deploy Settings

Vercel tự động deploy khi:
- ✅ Push code lên `main` branch → **Production**
- ✅ Push code lên branch khác → **Preview**
- ✅ Tạo Pull Request → **Preview**

Có thể tắt/bật trong **Settings** → **Git**

---

## 🔄 Auto-Deploy

### Production Deployments
- Tự động deploy khi push lên `main` branch
- Mỗi commit tạo deployment mới
- Có thể rollback về version cũ

### Preview Deployments
- Mỗi branch có URL preview riêng
- Mỗi PR có URL preview riêng
- Test trước khi merge

---

## 🐛 Troubleshooting

### ❌ Lỗi: Build Failed

**Nguyên nhân:**
- Thiếu dependencies
- Lỗi syntax trong code
- Environment variables chưa set

**Giải pháp:**
1. Xem **Build Logs** để tìm lỗi cụ thể
2. Test build local trước:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
3. Kiểm tra environment variables đã set đúng chưa

### ❌ Lỗi: 404 Not Found

**Nguyên nhân:**
- Routing không đúng
- File không tồn tại

**Giải pháp:**
1. Kiểm tra file trong `pages/` folder
2. Kiểm tra `next.config.js` có đúng không
3. Xem logs trong Vercel dashboard

### ❌ Lỗi: API Calls Failed

**Nguyên nhân:**
- `NEXT_PUBLIC_API_URL` chưa set hoặc sai
- Backend chưa chạy
- CORS issues

**Giải pháp:**
1. Kiểm tra `NEXT_PUBLIC_API_URL` trong Environment Variables
2. Đảm bảo backend đang chạy
3. Kiểm tra CORS settings trên backend
4. Test API bằng Postman/curl

### ❌ Lỗi: Images Not Loading

**Nguyên nhân:**
- Image optimization chưa config
- Remote images không được allow

**Giải pháp:**
1. Kiểm tra `next.config.js` có `remotePatterns` đúng không
2. Thêm domain backend vào `remotePatterns`:
   ```javascript
   remotePatterns: [
     {
       protocol: 'https',
       hostname: 'your-backend.onrender.com',
     },
   ]
   ```

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Optional)

1. Vào Project → **Analytics**
2. Enable Analytics (có thể cần upgrade plan)
3. Xem:
   - Page views
   - Performance metrics
   - Real-time visitors

### Logs

1. Vào Project → **Deployments**
2. Click vào deployment
3. Xem **Logs** tab
4. Real-time logs và search

---

## ✅ Checklist Deploy

- [ ] Đăng ký Vercel account
- [ ] Connect GitHub repository
- [ ] Set **Root Directory**: `frontend`
- [ ] Set **NEXT_PUBLIC_API_URL** environment variable
- [ ] Set **NODE_ENV=production**
- [ ] Deploy lần đầu
- [ ] Test app trên production URL
- [ ] Kiểm tra API calls hoạt động
- [ ] Setup custom domain (optional)
- [ ] Test auto-deploy bằng cách push code mới

---

## 🎉 Kết Quả

Sau khi deploy thành công:

✅ **App live tại**: `https://your-app.vercel.app`  
✅ **Auto-deploy**: Tự động deploy khi push code  
✅ **Preview deployments**: Mỗi PR có URL riêng  
✅ **SSL tự động**: HTTPS được enable tự động  
✅ **CDN toàn cầu**: Tốc độ nhanh ở mọi nơi  
✅ **Image optimization**: Tự động optimize images  
✅ **Analytics**: Theo dõi traffic và performance  

---

## 💡 Tips & Best Practices

1. **Environment Variables**
   - Luôn dùng `NEXT_PUBLIC_*` prefix cho public variables
   - Không commit `.env` files
   - Set variables cho cả Production, Preview, Development

2. **Build Optimization**
   - Vercel tự động optimize, không cần config thêm
   - Sử dụng Next.js Image component cho images
   - Enable compression trong `next.config.js`

3. **Preview Deployments**
   - Test trên preview URL trước khi merge
   - Share preview URL với team để review
   - Mỗi PR có URL riêng, dễ test

4. **Custom Domain**
   - Setup DNS đúng theo hướng dẫn
   - SSL certificate tự động
   - Có thể dùng subdomain

---

## 📞 Cần Hỗ Trợ?

Nếu gặp vấn đề:
1. Xem **Build Logs** trong Vercel dashboard
2. Kiểm tra **Documentation**: https://vercel.com/docs
3. Test build local trước khi deploy
4. Kiểm tra environment variables

---

**Chúc bạn deploy thành công! 🚀**

