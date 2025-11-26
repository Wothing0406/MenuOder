# 🚀 Hướng Dẫn Deploy Lên Render

## 📋 Tổng Quan

Sau khi push code lên GitHub, Render có thể không tự động deploy. Bạn cần **manual trigger deployment** hoặc kiểm tra cấu hình auto-deploy.

---

## ✅ Cách 1: Manual Deploy (Nhanh Nhất)

### Bước 1: Đăng Nhập Render Dashboard
1. Truy cập: https://dashboard.render.com
2. Đăng nhập vào tài khoản của bạn

### Bước 2: Chọn Service Cần Deploy
- Chọn **Backend service** (nếu có thay đổi backend)
- Chọn **Frontend service** (nếu có thay đổi frontend)
- Hoặc deploy cả 2 nếu có thay đổi ở cả 2

### Bước 3: Trigger Manual Deploy
1. Vào service bạn muốn deploy
2. Click vào tab **"Events"** hoặc tìm nút **"Manual Deploy"**
3. Click **"Manual Deploy"** → Chọn **"Deploy latest commit"**
4. Render sẽ bắt đầu build và deploy code mới nhất từ GitHub

### Bước 4: Chờ Deploy Hoàn Tất
- Xem log trong tab **"Events"** hoặc **"Logs"**
- Thời gian deploy thường mất 2-5 phút
- Khi thấy "Your service is live" → Deploy thành công!

---

## ⚙️ Cách 2: Kiểm Tra & Bật Auto-Deploy

### Kiểm Tra Cấu Hình Auto-Deploy

1. Vào **Settings** của service
2. Tìm phần **"Build & Deploy"**
3. Kiểm tra các mục sau:

#### ✅ Auto-Deploy
- **Bật**: Render sẽ tự động deploy khi có commit mới trên GitHub
- **Tắt**: Cần manual deploy mỗi lần

#### ✅ Branch
- Đảm bảo đang set là `main` (hoặc branch bạn đang dùng)
- Nếu sai branch, Render sẽ không nhận được code mới

#### ✅ Root Directory (Nếu cần)
- **Backend**: `backend` (nếu service là backend)
- **Frontend**: `frontend` (nếu service là frontend)

### Cách Bật Auto-Deploy

1. Vào **Settings** → **Build & Deploy**
2. Tìm **"Auto-Deploy"**
3. Chọn **"Yes"** hoặc bật toggle
4. Đảm bảo **Branch** là `main`
5. Click **"Save Changes"**

---

## 🔍 Kiểm Tra Deployment Status

### Xem Logs
1. Vào service trên Render Dashboard
2. Click tab **"Logs"**
3. Xem quá trình build và deploy
4. Nếu có lỗi, sẽ hiển thị trong logs

### Xem Events
1. Click tab **"Events"**
2. Xem lịch sử các lần deploy
3. Kiểm tra commit hash có khớp với commit mới nhất không

---

## 🐛 Troubleshooting

### Vấn Đề: Render vẫn chạy code cũ

**Giải pháp:**
1. ✅ Kiểm tra commit mới nhất trên GitHub
2. ✅ Manual deploy trên Render Dashboard
3. ✅ Kiểm tra branch trong Render Settings
4. ✅ Xem logs để tìm lỗi

### Vấn Đề: Build Failed

**Giải pháp:**
1. Xem logs để tìm lỗi cụ thể
2. Kiểm tra:
   - Environment variables đã set đúng chưa
   - Dependencies có thiếu không
   - Build command có đúng không

### Vấn Đề: Auto-Deploy không hoạt động

**Giải pháp:**
1. Kiểm tra webhook trên GitHub:
   - Vào GitHub repo → Settings → Webhooks
   - Xem có webhook từ Render không
2. Reconnect GitHub trên Render:
   - Settings → Connect GitHub
   - Disconnect và connect lại

---

## 📝 Checklist Sau Khi Push Code

- [ ] Code đã được push lên GitHub thành công
- [ ] Commit mới nhất đã có trên GitHub
- [ ] Manual deploy trên Render (hoặc kiểm tra auto-deploy)
- [ ] Chờ deploy hoàn tất (2-5 phút)
- [ ] Kiểm tra website có chạy code mới không
- [ ] Test các tính năng mới

---

## 🎯 Lưu Ý Quan Trọng

1. **Backend và Frontend là 2 service riêng biệt**
   - Nếu thay đổi backend → Deploy backend service
   - Nếu thay đổi frontend → Deploy frontend service
   - Nếu thay đổi cả 2 → Deploy cả 2

2. **Environment Variables**
   - Đảm bảo tất cả env variables đã được set trên Render
   - Kiểm tra trong Settings → Environment

3. **Database Migrations**
   - Nếu có thay đổi database schema, cần chạy migrations
   - Có thể chạy qua Render Shell hoặc script

---

## 📞 Cần Hỗ Trợ?

Nếu vẫn gặp vấn đề:
1. Xem logs chi tiết trên Render
2. Kiểm tra GitHub repository có commit mới không
3. Thử disconnect và reconnect GitHub trên Render

---

**Chúc bạn deploy thành công! 🎉**


