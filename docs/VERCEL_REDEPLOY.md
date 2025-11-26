# 🔄 Hướng Dẫn Reset & Redeploy Trên Vercel

## 📋 Các Cách Redeploy

Có nhiều cách để redeploy trên Vercel, tùy vào mục đích:

---

## 🚀 Cách 1: Redeploy Deployment Cũ (Nhanh Nhất)

### Khi Nào Dùng:
- ✅ Muốn deploy lại version cũ
- ✅ Muốn clear cache
- ✅ Không có code mới

### Các Bước:

1. **Vào Vercel Dashboard**
   - Truy cập: https://vercel.com
   - Đăng nhập vào tài khoản

2. **Chọn Project**
   - Click vào project bạn muốn redeploy

3. **Vào Tab Deployments**
   - Click tab **"Deployments"** ở trên cùng

4. **Chọn Deployment**
   - Tìm deployment bạn muốn redeploy
   - Click vào **"..."** (3 chấm) bên cạnh deployment

5. **Redeploy**
   - Chọn **"Redeploy"**
   - Xác nhận redeploy
   - Chờ 2-5 phút

---

## 🔄 Cách 2: Redeploy với Clear Cache

### Khi Nào Dùng:
- ✅ Muốn build lại từ đầu
- ✅ Có vấn đề với cache
- ✅ Muốn đảm bảo build mới nhất

### Các Bước:

1. **Vào Deployment**
   - Chọn deployment bạn muốn redeploy
   - Click vào deployment để xem chi tiết

2. **Redeploy với Options**
   - Click **"..."** → **"Redeploy"**
   - Hoặc vào **Settings** → **Deployments**
   - Chọn **"Redeploy with Build Cache cleared"**

3. **Hoặc dùng Vercel CLI:**
   ```bash
   vercel --force
   ```

---

## 📤 Cách 3: Push Code Mới (Tự Động Deploy)

### Khi Nào Dùng:
- ✅ Có code mới cần deploy
- ✅ Muốn deploy version mới nhất từ GitHub

### Các Bước:

1. **Commit và Push Code**
   ```bash
   git add .
   git commit -m "Update code"
   git push origin main
   ```

2. **Vercel Tự Động Deploy**
   - Vercel sẽ tự động detect push
   - Tự động trigger deployment
   - Xem progress trong Vercel dashboard

3. **Kiểm Tra**
   - Vào **Deployments** tab
   - Xem deployment mới đang build
   - Chờ hoàn tất

---

## 🔧 Cách 4: Redeploy với Environment Variables Mới

### Khi Nào Dùng:
- ✅ Đã thay đổi environment variables
- ✅ Cần deploy lại để áp dụng env vars mới

### Các Bước:

1. **Cập Nhật Environment Variables**
   - Vào **Settings** → **Environment Variables**
   - Thêm hoặc sửa biến
   - Click **"Save"**

2. **Redeploy**
   - Vào **Deployments**
   - Chọn deployment mới nhất
   - Click **"..."** → **"Redeploy"**

3. **Hoặc Push Code Mới**
   - Push bất kỳ commit nào lên GitHub
   - Vercel sẽ tự động deploy với env vars mới

---

## 🗑️ Cách 5: Xóa và Deploy Lại (Reset Hoàn Toàn)

### Khi Nào Dùng:
- ✅ Muốn reset hoàn toàn
- ✅ Có vấn đề nghiêm trọng
- ✅ Muốn bắt đầu lại từ đầu

### ⚠️ CẨN THẬN: Cách này sẽ xóa tất cả deployments!

### Các Bước:

1. **Xóa Project (Nếu Cần)**
   - Vào **Settings** → Scroll xuống cuối
   - Click **"Delete Project"**
   - Xác nhận xóa

2. **Tạo Project Mới**
   - Click **"Add New Project"**
   - Chọn repository từ GitHub
   - Cấu hình lại:
     - Root Directory: `frontend`
     - Environment Variables
     - Build settings

3. **Deploy**
   - Click **"Deploy"**
   - Chờ build xong

---

## 🛠️ Cách 6: Sử Dụng Vercel CLI

### Khi Nào Dùng:
- ✅ Muốn deploy từ terminal
- ✅ Muốn tự động hóa
- ✅ Developer muốn control nhiều hơn

### Cài Đặt Vercel CLI:

```bash
npm install -g vercel
```

### Login:

```bash
vercel login
```

### Deploy:

```bash
# Deploy production
vercel --prod

# Deploy preview
vercel

# Deploy với clear cache
vercel --force

# Deploy từ folder cụ thể
cd frontend
vercel --prod
```

---

## 🔍 Kiểm Tra Deployment Status

### Xem Logs:

1. Vào **Deployments** tab
2. Click vào deployment bạn muốn xem
3. Xem tab **"Logs"** để:
   - Xem build logs
   - Tìm lỗi
   - Xem progress

### Xem Build Details:

1. Click vào deployment
2. Xem:
   - **Build Time**: Thời gian build
   - **Build Size**: Kích thước build
   - **Commit**: Commit hash
   - **Branch**: Branch được deploy

---

## 🐛 Troubleshooting

### Vấn Đề: Redeploy Không Hoạt Động

**Giải pháp:**
1. Kiểm tra bạn có quyền admin không
2. Thử logout và login lại
3. Clear browser cache
4. Thử cách khác (push code mới)

### Vấn Đề: Build Failed

**Giải pháp:**
1. Xem **Logs** để tìm lỗi cụ thể
2. Kiểm tra:
   - Environment variables đã set đúng chưa
   - Dependencies có thiếu không
   - Build command có đúng không
3. Test build local trước:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

### Vấn Đề: Environment Variables Không Áp Dụng

**Giải pháp:**
1. Đảm bảo đã **Save** environment variables
2. Redeploy sau khi thay đổi env vars
3. Kiểm tra env vars có đúng environment không (Production/Preview/Development)

### Vấn Đề: Cache Cũ Vẫn Hiển Thị

**Giải pháp:**
1. Redeploy với **"Clear Build Cache"**
2. Hoặc dùng Vercel CLI: `vercel --force`
3. Clear browser cache
4. Hard refresh: `Ctrl + Shift + R` (Windows) hoặc `Cmd + Shift + R` (Mac)

---

## 📝 Checklist Redeploy

- [ ] Xác định mục đích redeploy (code mới, env vars, cache, etc.)
- [ ] Chọn phương pháp phù hợp
- [ ] Nếu có env vars mới, đã set chưa?
- [ ] Redeploy
- [ ] Chờ build hoàn tất (2-5 phút)
- [ ] Kiểm tra logs nếu có lỗi
- [ ] Test app trên production URL
- [ ] Kiểm tra các tính năng chính

---

## 🎯 Best Practices

1. **Redeploy Thường Xuyên**
   - Mỗi khi có code mới
   - Sau khi thay đổi env vars
   - Sau khi fix bugs

2. **Kiểm Tra Trước Khi Deploy**
   - Test build local trước
   - Kiểm tra env vars
   - Review code changes

3. **Sử Dụng Preview Deployments**
   - Test trên preview trước khi merge
   - Share preview URL với team
   - Chỉ merge khi preview OK

4. **Monitor Deployments**
   - Xem logs sau mỗi deploy
   - Kiểm tra build time
   - Monitor errors

---

## 💡 Tips

1. **Quick Redeploy:**
   - Dùng cách 1 (Redeploy deployment cũ) - nhanh nhất
   - Không cần push code mới

2. **Force Clear Cache:**
   - Dùng Vercel CLI: `vercel --force`
   - Hoặc chọn "Clear Build Cache" khi redeploy

3. **Rollback:**
   - Nếu deployment mới có lỗi
   - Vào **Deployments** → Chọn deployment cũ → **"Promote to Production"**

4. **Multiple Environments:**
   - Production: Tự động deploy từ `main` branch
   - Preview: Tự động deploy từ các branch khác
   - Development: Có thể set riêng

---

## 🎉 Kết Quả

Sau khi redeploy thành công:
- ✅ App được update với code/env vars mới
- ✅ Cache được clear (nếu chọn)
- ✅ Build logs có sẵn để debug
- ✅ Có thể rollback nếu cần

---

**Chúc bạn redeploy thành công! 🚀**


