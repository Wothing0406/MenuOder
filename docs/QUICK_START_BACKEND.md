# Hướng dẫn Khởi động Backend Nhanh

## 🚀 Khởi động Backend (3 bước)

### Bước 1: Cài đặt dependencies

```bash
cd backend
npm install
```

### Bước 2: Cấu hình database

Tạo file `.env` trong thư mục `backend`:

**Cho MySQL:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=menu_order_db
PORT=5002
```

**Cho PostgreSQL:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/menu_order_db
PORT=5002
```

### Bước 3: Chạy migration và start server

```bash
# Chạy migration (nếu chưa chạy)
npm run migrate:all

# Start server
npm start
```

## ✅ Kiểm tra server đã chạy

Mở trình duyệt hoặc dùng curl:

```bash
# Health check
curl http://localhost:5002/health

# Hoặc mở trong browser
http://localhost:5002/health
```

Kết quả mong đợi:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "...",
  "uptime": ...
}
```

## 🔍 Nếu gặp lỗi

### Lỗi "Cannot find module"

```bash
cd backend
npm install
```

### Lỗi "Port already in use"

**Windows:**
```powershell
# Tìm và kill process
netstat -ano | findstr :5002
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:5002 | xargs kill -9
```

**Hoặc đổi port trong `.env`:**
```env
PORT=5003
```

### Lỗi "Database connection failed"

1. Kiểm tra database service có đang chạy không
2. Kiểm tra thông tin trong `.env`
3. Test connection:
   ```bash
   npm run test-db
   ```

### Kiểm tra code có lỗi không

```bash
npm run check
```

## 📝 Checklist

Trước khi start server, đảm bảo:

- [ ] Đã cài `npm install`
- [ ] Đã tạo file `.env` với thông tin database
- [ ] Database service đang chạy
- [ ] Port 5002 không bị chiếm
- [ ] Đã chạy migration (nếu cần)

## 🎯 Kết quả mong đợi

Khi server chạy thành công, bạn sẽ thấy:

```
✅ Database connection established
✅ Database synchronized
🚀 Server running on http://0.0.0.0:5002
📱 Frontend should connect to: http://localhost:5002/api
🔗 Health check: http://localhost:5002/health
```

## 📚 Tài liệu liên quan

- [DEBUG_BACKEND.md](./DEBUG_BACKEND.md) - Hướng dẫn debug chi tiết
- [MIGRATION_GUIDE.md](../database/MIGRATION_GUIDE.md) - Hướng dẫn migration



## 🚀 Khởi động Backend (3 bước)

### Bước 1: Cài đặt dependencies

```bash
cd backend
npm install
```

### Bước 2: Cấu hình database

Tạo file `.env` trong thư mục `backend`:

**Cho MySQL:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=menu_order_db
PORT=5002
```

**Cho PostgreSQL:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/menu_order_db
PORT=5002
```

### Bước 3: Chạy migration và start server

```bash
# Chạy migration (nếu chưa chạy)
npm run migrate:all

# Start server
npm start
```

## ✅ Kiểm tra server đã chạy

Mở trình duyệt hoặc dùng curl:

```bash
# Health check
curl http://localhost:5002/health

# Hoặc mở trong browser
http://localhost:5002/health
```

Kết quả mong đợi:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "...",
  "uptime": ...
}
```

## 🔍 Nếu gặp lỗi

### Lỗi "Cannot find module"

```bash
cd backend
npm install
```

### Lỗi "Port already in use"

**Windows:**
```powershell
# Tìm và kill process
netstat -ano | findstr :5002
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:5002 | xargs kill -9
```

**Hoặc đổi port trong `.env`:**
```env
PORT=5003
```

### Lỗi "Database connection failed"

1. Kiểm tra database service có đang chạy không
2. Kiểm tra thông tin trong `.env`
3. Test connection:
   ```bash
   npm run test-db
   ```

### Kiểm tra code có lỗi không

```bash
npm run check
```

## 📝 Checklist

Trước khi start server, đảm bảo:

- [ ] Đã cài `npm install`
- [ ] Đã tạo file `.env` với thông tin database
- [ ] Database service đang chạy
- [ ] Port 5002 không bị chiếm
- [ ] Đã chạy migration (nếu cần)

## 🎯 Kết quả mong đợi

Khi server chạy thành công, bạn sẽ thấy:

```
✅ Database connection established
✅ Database synchronized
🚀 Server running on http://0.0.0.0:5002
📱 Frontend should connect to: http://localhost:5002/api
🔗 Health check: http://localhost:5002/health
```

## 📚 Tài liệu liên quan

- [DEBUG_BACKEND.md](./DEBUG_BACKEND.md) - Hướng dẫn debug chi tiết
- [MIGRATION_GUIDE.md](../database/MIGRATION_GUIDE.md) - Hướng dẫn migration

