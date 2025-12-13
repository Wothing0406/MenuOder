# ✅ Checklist Deploy Nhanh

## 🚀 Trước Khi Deploy

- [ ] Code đã push lên GitHub
- [ ] Database trên Render đã được tạo
- [ ] Environment Variables đã được set trong Render Dashboard

## ⚙️ Cấu Hình Render (QUAN TRỌNG!)

### Environment Variables (BẮT BUỘC):

```env
AUTO_MIGRATE=true          # ⭐ BẮT BUỘC để tự động chạy migrations
NODE_ENV=production
DATABASE_URL=postgres://... # hoặc DB_HOST, DB_USER, etc.
JWT_SECRET=your-secret
BACKEND_URL=https://your-backend.onrender.com
FRONTEND_URL=https://your-frontend.vercel.app
```

### Build & Start Commands:

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

**Root Directory:**
```
backend
```

## ✅ Sau Khi Deploy

- [ ] Vào Render Dashboard → Logs
- [ ] Tìm dòng: `✅ Migrations completed`
- [ ] Test API: `https://your-backend.onrender.com/health`
- [ ] Test tạo đơn hàng (không có lỗi `paymentAccountId`)

## 🆘 Nếu Migration Không Chạy

1. Vào Render Shell
2. Chạy: `cd backend && npm run migrate:paymentAccountId`
3. Hoặc: `cd backend && npm run migrate`

---

**Xem chi tiết:** `DEPLOY_MIGRATION_GUIDE.md`

