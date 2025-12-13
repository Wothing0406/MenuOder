# 🚀 Hướng Dẫn Deploy Lên Render & Vercel

## 📋 Tổng Quan

Hướng dẫn này sẽ giúp bạn deploy ứng dụng lên:
- **Backend + Database:** Render.com
- **Frontend:** Vercel.com

**⚠️ QUAN TRỌNG:** Để giữ lại dữ liệu hiện tại, bạn cần backup database trước khi deploy.

---

## 🔄 Bước 1: Backup Database Hiện Tại

### 1.1 Backup Database Local

```bash
cd backend
node scripts/backup-database.js
```

File backup sẽ được lưu tại: `backend/backups/backup-YYYY-MM-DD.sql`

### 1.2 Export Database Manual (Nếu cần)

Nếu bạn đang dùng MySQL local:

```bash
mysqldump -u [username] -p [database_name] > backup.sql
```

---

## 🌐 Bước 2: Deploy Backend Lên Render

### 2.1 Tạo Web Service trên Render

1. Đăng nhập vào [Render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect repository GitHub của bạn
4. Cấu hình:
   - **Name:** `menuorder-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Root Directory:** `backend` (nếu repo có cả frontend)

### 2.2 Cấu Hình Environment Variables

Trong Render Dashboard → Environment Variables, thêm:

```env
# Database (Render PostgreSQL hoặc External MySQL)
DB_HOST=your-database-host
DB_PORT=5432
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
DB_TYPE=postgres  # hoặc mysql

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Backend URL
BACKEND_URL=https://your-backend.onrender.com

# Node Environment
NODE_ENV=production

# Auto Migration (tự động cập nhật bảng/cột khi deploy)
AUTO_MIGRATE=true
```

### 2.3 Tạo Database trên Render

1. Click **"New +"** → **"PostgreSQL"** (hoặc dùng MySQL external)
2. Copy connection string
3. Cập nhật Environment Variables với thông tin database mới

### 2.4 Auto Migration (Tự Động Cập Nhật Bảng/Cột)

**✅ ĐÃ TỰ ĐỘNG:** Backend sẽ tự động chạy migrations khi deploy lên Render!

**Cách hoạt động:**
- Khi `NODE_ENV=production` và `AUTO_MIGRATE=true`, backend sẽ tự động chạy migrations khi start
- Migrations sẽ tự động thêm các cột còn thiếu vào database
- An toàn: Nếu cột đã tồn tại, sẽ tự động skip (không gây lỗi)

**Environment Variable cần thêm trên Render:**
```env
AUTO_MIGRATE=true
```

**Nếu muốn tắt auto migration:**
```env
AUTO_MIGRATE=false
```

**Lưu ý:** 
- Migrations sẽ tự động skip nếu cột đã tồn tại, nên an toàn để chạy nhiều lần
- Nếu có lỗi migration, server vẫn sẽ start (non-fatal error)
- Có thể chạy manual trong Render Shell nếu cần: `npm run deploy:migrate`

### 2.5 Import Dữ Liệu Cũ (QUAN TRỌNG!)

**Để giữ lại dữ liệu hiện tại, bạn cần import backup:**

**Cho PostgreSQL (Render):**
```bash
# Vào Render Shell
cd backend
# Upload file backup.sql lên Render (hoặc dùng wget/curl)
psql $DATABASE_URL < backups/backup-YYYY-MM-DD.sql
```

**Cho MySQL (External):**
```bash
# Vào Render Shell hoặc local terminal
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < backend/backups/backup-YYYY-MM-DD.sql
```

**Hoặc sử dụng Render Dashboard:**
1. Vào Database Dashboard
2. Click "Connect" → "External Connection"
3. Dùng MySQL client để import backup.sql

---

## ⚡ Bước 3: Deploy Frontend Lên Vercel

### 3.1 Tạo Project trên Vercel

1. Đăng nhập vào [Vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import repository GitHub
4. Cấu hình:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (hoặc `cd frontend && npm run build`)
   - **Output Directory:** `.next`

### 3.2 Cấu Hình Environment Variables

Trong Vercel Dashboard → Settings → Environment Variables:

```env
# API URL
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api

# Node Environment
NODE_ENV=production
```

### 3.3 Deploy

Vercel sẽ tự động build và deploy khi bạn push code lên GitHub.

---

## 🔧 Bước 4: Cập Nhật Code Cho Production

### 4.1 Backend - Thêm Auto Migration

Tạo file `backend/src/index.js` với logic chạy migrations tự động:

```javascript
// Thêm vào cuối file index.js (sau khi connect database)
if (process.env.NODE_ENV === 'production' && process.env.RUN_MIGRATIONS === 'true') {
  const { runSequentialMigrations } = require('../scripts/deploy-migrations');
  runSequentialMigrations().then(() => {
    console.log('✅ Migrations completed');
  }).catch(err => {
    console.error('❌ Migration error:', err);
  });
}
```

### 4.2 Frontend - Cập Nhật API URL

Đảm bảo file `frontend/lib/api.js` sử dụng `NEXT_PUBLIC_API_URL`:

```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';
```

---

## 📝 Checklist Deploy

- [ ] Backup database local
- [ ] Tạo Render Web Service cho backend
- [ ] Tạo Render PostgreSQL database (hoặc dùng MySQL external)
- [ ] Cấu hình Environment Variables trên Render
- [ ] Deploy backend
- [ ] Chạy migrations trên Render
- [ ] Import dữ liệu cũ (nếu có)
- [ ] Tạo Vercel project cho frontend
- [ ] Cấu hình Environment Variables trên Vercel
- [ ] Deploy frontend
- [ ] Test API endpoints
- [ ] Test frontend connection với backend

---

## 🐛 Troubleshooting

### Backend không kết nối được database
- Kiểm tra Environment Variables trên Render
- Kiểm tra database connection string
- Kiểm tra firewall rules

### Migrations không chạy
- Chạy manual trong Render Shell
- Kiểm tra logs trên Render Dashboard

### Frontend không kết nối được backend
- Kiểm tra `NEXT_PUBLIC_API_URL` trên Vercel
- Kiểm tra CORS settings trên backend
- Kiểm tra backend URL có đúng không

---

## 🔐 Bảo Mật

1. **Không commit** `.env` files
2. Sử dụng **Environment Variables** trên Render/Vercel
3. Đổi **JWT_SECRET** thành giá trị mạnh
4. Enable **HTTPS** (Render và Vercel tự động có)

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
- Render logs: Dashboard → Logs
- Vercel logs: Dashboard → Deployments → View Function Logs
- Backend logs: Render Dashboard → Logs

---

**Chúc bạn deploy thành công! 🎉**

