# 🔧 Sửa Lỗi Build Trên Vercel

## ✅ Các Lỗi Đã Sửa

### 1. **Lỗi JSON Syntax trong `vercel.json`**
- ❌ **Trước:** File có duplicate keys và cấu trúc JSON không hợp lệ
- ✅ **Sau:** Đã sửa thành JSON hợp lệ

### 2. **Lỗi JSON Syntax trong `frontend/vercel.json`**
- ❌ **Trước:** File có duplicate keys
- ✅ **Sau:** Đã sửa thành JSON hợp lệ

### 3. **Script Start Không Tương Thích Với Vercel**
- ❌ **Trước:** `"start": "node .next/standalone/server.js"` (không cần cho Vercel)
- ✅ **Sau:** `"start": "next start"` (Vercel tự động handle Next.js)

## 📋 Cấu Hình Vercel Đúng

### Option 1: Tự Động (Khuyến Nghị)
Vercel tự động detect Next.js nếu:
- Có `package.json` trong thư mục `frontend`
- Có `next.config.js` trong thư mục `frontend`

**Cấu hình trong Vercel Dashboard:**
- **Root Directory:** `frontend`
- **Framework Preset:** Next.js (tự động)
- **Build Command:** `npm run build` (tự động)
- **Output Directory:** `.next` (tự động)

### Option 2: Cấu Hình Thủ Công
Nếu muốn cấu hình thủ công, dùng `vercel.json` ở root:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/.next",
  "devCommand": "cd frontend && npm run dev",
  "installCommand": "cd frontend && npm install",
  "framework": "nextjs"
}
```

**Lưu ý:** Nếu dùng `vercel.json` ở root, **KHÔNG** cần set Root Directory trong Dashboard.

## 🔍 Kiểm Tra Lỗi Build

### 1. Kiểm Tra Logs Trên Vercel
1. Vào Vercel Dashboard → Deployments
2. Click vào deployment bị lỗi
3. Xem Build Logs để tìm lỗi cụ thể

### 2. Các Lỗi Thường Gặp

#### Lỗi: "Cannot find module"
```bash
# Kiểm tra dependencies trong package.json
cd frontend
npm install
npm run build
```

#### Lỗi: "Environment variable not found"
- Đảm bảo đã set `NEXT_PUBLIC_API_URL` trong Vercel Dashboard
- Vào Settings → Environment Variables
- Thêm: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`

#### Lỗi: "Build command failed"
- Kiểm tra `package.json` có script `build` không
- Kiểm tra `next.config.js` có lỗi syntax không
- Test build local: `cd frontend && npm run build`

#### Lỗi: "Output directory not found"
- Vercel tự động detect `.next` folder
- Nếu dùng custom output, set trong `vercel.json`

## 🚀 Deploy Lại Sau Khi Sửa

1. **Commit và Push:**
   ```bash
   git add .
   git commit -m "Fix Vercel build errors"
   git push
   ```

2. **Vercel sẽ tự động deploy lại**

3. **Hoặc Deploy Manual:**
   - Vào Vercel Dashboard
   - Click "Redeploy" trên deployment cũ

## ✅ Checklist Trước Khi Deploy

- [ ] `vercel.json` có cú pháp JSON hợp lệ
- [ ] `frontend/package.json` có script `build` và `start`
- [ ] `frontend/next.config.js` không có lỗi syntax
- [ ] Environment Variables đã được set trên Vercel:
  - [ ] `NEXT_PUBLIC_API_URL`
  - [ ] `NODE_ENV=production` (optional)
- [ ] Root Directory được set đúng: `frontend`
- [ ] Test build local thành công: `cd frontend && npm run build`

## 📞 Nếu Vẫn Bị Lỗi

1. **Copy Build Logs** từ Vercel Dashboard
2. **Kiểm tra lỗi cụ thể** trong logs
3. **Test build local** để reproduce lỗi:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

## 🔗 Tài Liệu Tham Khảo

- [Vercel Next.js Documentation](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Configuration Reference](https://vercel.com/docs/projects/project-configuration)

