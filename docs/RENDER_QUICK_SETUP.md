# 🚀 Hướng Dẫn Nhanh Setup Render PostgreSQL

## ⚡ Bước 1: Tạo PostgreSQL Database trên Render

1. **Vào Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → Chọn **"PostgreSQL"**
3. **Điền thông tin**:
   - **Name**: `menuorder-db`
   - **Database**: `menu_order_db`
   - **User**: (để mặc định, tự động tạo)
   - **Region**: Singapore (hoặc gần nhất)
   - **PostgreSQL Version**: 15 (mới nhất)
   - **Plan**: **Free** (512 MB RAM)
4. **Click "Create Database"**
5. **Chờ vài phút** để Render tạo database xong

---

## ⚡ Bước 2: Link Database với Backend Service

1. **Vào Backend Service** của bạn trên Render
2. Tìm phần **"Connections"** hoặc **"Services"**
3. **Click "Link Database"** → Chọn PostgreSQL service vừa tạo (`menuorder-db`)
4. Render sẽ **tự động thêm** biến `DATABASE_URL` vào Environment Variables

> ✅ **Làm xong bước này là database đã được cấu hình!**

---

## ⚡ Bước 3: Deploy Code Mới

1. **Commit code** đã cập nhật (đã thêm PostgreSQL support):
   ```bash
   git add .
   git commit -m "Add PostgreSQL support for Render"
   git push origin main
   ```
2. Render sẽ **tự động deploy lại**
3. Kiểm tra logs để xem kết nối database thành công

---

## ✅ Kiểm Tra Kết Nối

Sau khi deploy xong, kiểm tra logs của Backend service:

**Thành công** sẽ thấy:
```
Database synchronized successfully
Server running on port 5000
```

**Lỗi** sẽ thấy:
```
SequelizeConnectionRefusedError
```
→ Kiểm tra lại `DATABASE_URL` đã được thêm chưa

---

## 📝 Environment Variables Cần Có

Sau khi link database, backend service của bạn sẽ tự động có:

- ✅ `DATABASE_URL` (tự động thêm khi link database)
- ✅ `PORT` (tự động set bởi Render)
- ✅ Các biến khác bạn cần thêm thủ công:
  - `NODE_ENV=production`
  - `JWT_SECRET=your_secret_key_here`
  - `JWT_EXPIRE=24h`
  - `FRONTEND_URL=https://your-frontend-url.onrender.com`
  - `UPLOAD_PATH=./uploads`

---

## 🔧 Troubleshooting Nhanh

### ❌ Lỗi: "Connection refused"
→ **Giải pháp**: Kiểm tra đã link database chưa, hoặc thêm `DATABASE_URL` thủ công

### ❌ Lỗi: "SSL required"
→ **Giải pháp**: Code đã được cập nhật để tự động dùng SSL ở production

### ❌ Lỗi: "Database does not exist"
→ **Giải pháp**: Kiểm tra tên database trong `DATABASE_URL` đúng chưa

---

## 🎉 Hoàn Tất!

Sau khi làm xong 3 bước trên, database sẽ hoạt động và backend có thể kết nối thành công!

---

## 📚 Xem Chi Tiết

Nếu cần hướng dẫn chi tiết hơn, xem: [RENDER_DATABASE_SETUP.md](./RENDER_DATABASE_SETUP.md)

