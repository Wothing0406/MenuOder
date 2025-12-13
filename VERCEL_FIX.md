# 🔧 Sửa Lỗi Vercel: Invalid frontend/vercel.json

## ✅ Đã Sửa

### File `frontend/vercel.json`:
- ❌ **Trước:** Có các field không cần thiết (`framework`, `buildCommand`, `installCommand`)
- ✅ **Sau:** Chỉ giữ lại `crons` (nếu cần cron jobs)

**Lý do:** Vercel tự động detect Next.js nếu có `package.json` và `next.config.js`, không cần config thủ công.

## 📋 Cấu Hình Vercel Đúng

### Option 1: Không Dùng vercel.json (Khuyến Nghị)

**Xóa cả 2 file:**
- `vercel.json` (ở root)
- `frontend/vercel.json` (hoặc để trống chỉ có `{}`)

**Cấu hình trong Vercel Dashboard:**
- **Root Directory:** `frontend`
- **Framework Preset:** Next.js (tự động detect)
- **Build Command:** `npm run build` (tự động)
- **Output Directory:** `.next` (tự động)

### Option 2: Chỉ Dùng vercel.json Ở Root (Nếu Root Directory = root)

Nếu bạn set Root Directory = root (không phải `frontend`), dùng file `vercel.json` ở root:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/.next",
  "devCommand": "cd frontend && npm run dev",
  "installCommand": "cd frontend && npm install",
  "framework": "nextjs"
}
```

### Option 3: Chỉ Dùng frontend/vercel.json (Nếu Root Directory = frontend)

Nếu bạn set Root Directory = `frontend`, chỉ cần file `frontend/vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/ping-render",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Hoặc xóa file này hoàn toàn** nếu không cần cron jobs.

## 🚀 Cách Setup Trên Vercel Dashboard

1. **Vào Vercel Dashboard** → Project Settings
2. **General Settings:**
   - **Root Directory:** `frontend` ⚠️ **QUAN TRỌNG**
   - **Framework Preset:** Next.js (tự động)
3. **Build & Development Settings:**
   - Để mặc định (Vercel tự động detect)
4. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com/api`
   - `NODE_ENV` = `production` (optional)

## ✅ Checklist

- [ ] Xóa hoặc sửa `frontend/vercel.json` (chỉ giữ `crons` nếu cần)
- [ ] Xóa `vercel.json` ở root (nếu Root Directory = `frontend`)
- [ ] Set Root Directory = `frontend` trong Vercel Dashboard
- [ ] Environment Variables đã được set
- [ ] Deploy lại và kiểm tra logs

## 🔍 Nếu Vẫn Bị Lỗi

1. **Xóa cả 2 file vercel.json:**
   ```bash
   rm vercel.json
   rm frontend/vercel.json
   ```

2. **Cấu hình trực tiếp trên Vercel Dashboard:**
   - Root Directory = `frontend`
   - Để Vercel tự động detect Next.js

3. **Deploy lại:**
   - Vercel sẽ tự động detect và build

## 📝 Lưu Ý

- Vercel tự động detect Next.js nếu có `package.json` và `next.config.js`
- Không cần `vercel.json` nếu cấu hình đơn giản
- Chỉ cần `vercel.json` nếu cần cron jobs, rewrites, hoặc config đặc biệt
- Nếu có conflict, ưu tiên cấu hình trên Dashboard

