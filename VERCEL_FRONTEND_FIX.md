# 🔧 Sửa Lỗi Frontend trên Vercel

## ✅ Checklist Kiểm Tra

### 1. Cấu Hình Vercel Dashboard

**Vào Vercel Dashboard → Project Settings:**

#### General Settings:
- ✅ **Root Directory:** `frontend` ⚠️ **QUAN TRỌNG**
- ✅ **Framework Preset:** Next.js (tự động detect)

#### Build & Development Settings:
- ✅ **Build Command:** `npm run build` (hoặc để mặc định)
- ✅ **Output Directory:** `.next` (hoặc để mặc định)
- ✅ **Install Command:** `npm install` (hoặc để mặc định)

#### Environment Variables:
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NODE_ENV=production
```

### 2. Kiểm Tra Files Cần Thiết

Đảm bảo có các file sau trong thư mục `frontend`:

- ✅ `package.json` - Có script `build` và `start`
- ✅ `next.config.js` - Cấu hình Next.js hợp lệ
- ✅ `tailwind.config.js` - Cấu hình Tailwind (nếu dùng)
- ✅ `postcss.config.js` - Cấu hình PostCSS (nếu dùng)
- ✅ `pages/` hoặc `app/` - Thư mục pages
- ✅ `styles/globals.css` hoặc tương tự - CSS chính

### 3. Không Cần vercel.json

- ❌ **KHÔNG** cần file `vercel.json` ở root
- ❌ **KHÔNG** cần file `frontend/vercel.json`
- Vercel tự động detect Next.js

## 🔍 Các Lỗi Thường Gặp

### Lỗi 1: "Cannot find module"
**Nguyên nhân:** Thiếu dependencies hoặc Root Directory sai

**Giải pháp:**
1. Kiểm tra Root Directory = `frontend`
2. Đảm bảo `package.json` có đầy đủ dependencies
3. Xóa `.next` và `node_modules` (nếu có), deploy lại

### Lỗi 2: "Invalid next.config.js"
**Nguyên nhân:** Lỗi syntax trong `next.config.js`

**Giải pháp:**
1. Kiểm tra syntax JSON/JavaScript
2. Test build local: `cd frontend && npm run build`
3. Sửa lỗi nếu có

### Lỗi 3: "Build failed - Missing environment variable"
**Nguyên nhân:** Thiếu `NEXT_PUBLIC_API_URL`

**Giải pháp:**
1. Vào Vercel Dashboard → Environment Variables
2. Thêm: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
3. Deploy lại

### Lỗi 4: "Module not found" hoặc "Cannot resolve"
**Nguyên nhân:** Import sai đường dẫn hoặc thiếu file

**Giải pháp:**
1. Kiểm tra các import trong code
2. Đảm bảo tất cả files được commit
3. Test build local để tìm lỗi cụ thể

### Lỗi 5: "Invalid vercel.json"
**Nguyên nhân:** File vercel.json có lỗi syntax

**Giải pháp:**
1. Xóa file `vercel.json` (nếu có)
2. Xóa file `frontend/vercel.json` (nếu có)
3. Để Vercel tự động detect

## 🚀 Cách Deploy Đúng

### Bước 1: Kiểm Tra Local
```bash
cd frontend
npm install
npm run build
```

Nếu build thành công local, sẽ build được trên Vercel.

### Bước 2: Commit và Push
```bash
git add .
git commit -m "Fix frontend build"
git push
```

### Bước 3: Kiểm Tra Vercel
1. Vào Vercel Dashboard → Deployments
2. Xem build logs
3. Tìm lỗi cụ thể nếu có

## 📝 Cấu Hình Tối Ưu

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

module.exports = nextConfig;
```

### package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## ✅ Checklist Trước Khi Deploy

- [ ] Root Directory = `frontend` trong Vercel Dashboard
- [ ] `package.json` có script `build` và `start`
- [ ] `next.config.js` không có lỗi syntax
- [ ] Build thành công local: `npm run build`
- [ ] Environment Variables đã được set:
  - [ ] `NEXT_PUBLIC_API_URL`
  - [ ] `NODE_ENV=production` (optional)
- [ ] Không có file `vercel.json` (hoặc đã xóa)
- [ ] Tất cả dependencies đã được commit

## 🔧 Nếu Vẫn Bị Lỗi

1. **Copy Build Logs** từ Vercel Dashboard
2. **Test build local:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```
3. **Kiểm tra lỗi cụ thể** trong logs
4. **Xóa cache và deploy lại:**
   - Vercel Dashboard → Settings → Clear Build Cache
   - Deploy lại

## 📞 Cần Giúp?

Nếu vẫn bị lỗi, cung cấp:
1. **Build logs** từ Vercel Dashboard
2. **Lỗi cụ thể** (error message)
3. **Kết quả build local** (`npm run build`)



