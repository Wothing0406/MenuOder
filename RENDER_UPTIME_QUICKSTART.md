# ⚡ Giữ Backend Render hoạt động 24/7 - Hướng dẫn nhanh

## 🎯 Vấn đề
Backend trên Render free tier sẽ tự động sleep sau 15 phút không có request.

## ✅ Giải pháp đã được tích hợp

Backend đã có các endpoint:
- `https://your-backend.onrender.com/ping` - Ping nhanh (khuyến nghị)
- `https://your-backend.onrender.com/health` - Health check với DB

## 🚀 Cách setup nhanh nhất (2 phút)

### Bước 1: Đăng ký UptimeRobot (FREE)
1. Truy cập: https://uptimerobot.com/
2. Đăng ký tài khoản (miễn phí)

### Bước 2: Tạo Monitor
1. Click "Add New Monitor"
2. Chọn **HTTP(s)**
3. Điền thông tin:
   - **Friendly Name**: `Backend Render`
   - **URL**: `https://your-backend-url.onrender.com/ping`
   - **Monitoring Interval**: `5 minutes`
4. Click "Create Monitor"

### Bước 3: Xong! 🎉
Monitor sẽ tự động ping backend mỗi 5 phút, giữ service luôn hoạt động.

## 🔄 Phương án thay thế: Dùng Vercel Cron (nếu frontend trên Vercel)

Đã được setup sẵn trong `frontend/vercel.json`:
- API route: `/api/ping-render`
- Schedule: Mỗi 5 phút

**Chỉ cần:**
1. Thêm biến môi trường `BACKEND_URL` trong Vercel Dashboard
2. Deploy lại frontend
3. Vercel sẽ tự động ping backend mỗi 5 phút

## 📚 Xem hướng dẫn chi tiết
Xem file `docs/RENDER_UPTIME_SETUP.md` để biết thêm các phương án khác.

## ⚠️ Lưu ý
- Ping mỗi 5 phút là đủ để giữ service awake
- Tất cả các phương án đều FREE
- Request đầu tiên sau khi sleep có thể chậm (cold start) - đây là bình thường



## 🎯 Vấn đề
Backend trên Render free tier sẽ tự động sleep sau 15 phút không có request.

## ✅ Giải pháp đã được tích hợp

Backend đã có các endpoint:
- `https://your-backend.onrender.com/ping` - Ping nhanh (khuyến nghị)
- `https://your-backend.onrender.com/health` - Health check với DB

## 🚀 Cách setup nhanh nhất (2 phút)

### Bước 1: Đăng ký UptimeRobot (FREE)
1. Truy cập: https://uptimerobot.com/
2. Đăng ký tài khoản (miễn phí)

### Bước 2: Tạo Monitor
1. Click "Add New Monitor"
2. Chọn **HTTP(s)**
3. Điền thông tin:
   - **Friendly Name**: `Backend Render`
   - **URL**: `https://your-backend-url.onrender.com/ping`
   - **Monitoring Interval**: `5 minutes`
4. Click "Create Monitor"

### Bước 3: Xong! 🎉
Monitor sẽ tự động ping backend mỗi 5 phút, giữ service luôn hoạt động.

## 🔄 Phương án thay thế: Dùng Vercel Cron (nếu frontend trên Vercel)

Đã được setup sẵn trong `frontend/vercel.json`:
- API route: `/api/ping-render`
- Schedule: Mỗi 5 phút

**Chỉ cần:**
1. Thêm biến môi trường `BACKEND_URL` trong Vercel Dashboard
2. Deploy lại frontend
3. Vercel sẽ tự động ping backend mỗi 5 phút

## 📚 Xem hướng dẫn chi tiết
Xem file `docs/RENDER_UPTIME_SETUP.md` để biết thêm các phương án khác.

## ⚠️ Lưu ý
- Ping mỗi 5 phút là đủ để giữ service awake
- Tất cả các phương án đều FREE
- Request đầu tiên sau khi sleep có thể chậm (cold start) - đây là bình thường






