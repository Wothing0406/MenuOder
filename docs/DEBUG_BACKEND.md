# Hướng dẫn Debug Backend

## 🔍 Kiểm tra nhanh

### Bước 1: Chạy script kiểm tra

```bash
cd backend
node scripts/check-backend.js
```

Script này sẽ kiểm tra:
- ✅ Các file quan trọng có lỗi syntax không
- ✅ Dependencies đã được cài đặt chưa
- ✅ Biến môi trường đã được set chưa
- ✅ Express app có load được không

### Bước 2: Kiểm tra server có đang chạy không

**Windows:**
```powershell
# Kiểm tra port 5002
netstat -ano | findstr :5002

# Hoặc kiểm tra process node
tasklist | findstr node
```

**Linux/Mac:**
```bash
# Kiểm tra port 5002
lsof -i :5002

# Hoặc
netstat -an | grep 5002
```

### Bước 3: Kiểm tra log khi start server

```bash
cd backend
npm start
```

Xem các thông báo:
- ✅ `Database connection established` - Database OK
- ✅ `Server running on http://0.0.0.0:5002` - Server OK
- ❌ Nếu có lỗi, xem chi tiết bên dưới

## 🐛 Các lỗi thường gặp

### 1. Lỗi "Cannot find module"

**Triệu chứng:**
```
Error: Cannot find module 'axios'
```

**Giải pháp:**
```bash
cd backend
npm install
```

### 2. Lỗi "Port already in use"

**Triệu chứng:**
```
❌ Port 5002 is already in use
```

**Giải pháp:**

**Windows:**
```powershell
# Tìm process đang dùng port
netstat -ano | findstr :5002

# Kill process (thay PID bằng số từ lệnh trên)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Tìm và kill process
lsof -ti:5002 | xargs kill -9
```

**Hoặc đổi port trong `.env`:**
```env
PORT=5003
```

### 3. Lỗi "Database connection failed"

**Triệu chứng:**
```
❌ Failed to start server: SequelizeConnectionError
```

**Giải pháp:**

1. **Kiểm tra database có đang chạy không:**
   - MySQL: Kiểm tra service MySQL
   - PostgreSQL: Kiểm tra service PostgreSQL

2. **Kiểm tra thông tin kết nối trong `.env`:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=menu_order_db
   ```

3. **Test kết nối:**
   ```bash
   cd backend
   npm run test-db
   ```

### 4. Lỗi "SyntaxError" hoặc "ReferenceError"

**Triệu chứng:**
```
SyntaxError: Unexpected token
ReferenceError: X is not defined
```

**Giải pháp:**

1. **Chạy script kiểm tra:**
   ```bash
   node scripts/check-backend.js
   ```

2. **Kiểm tra file có lỗi:**
   - Xem log để biết file nào bị lỗi
   - Kiểm tra syntax trong file đó

3. **Kiểm tra Node.js version:**
   ```bash
   node --version
   ```
   Cần Node.js 18+ 

### 5. Lỗi "Module not found" cho file mới

**Triệu chứng:**
```
Error: Cannot find module './utils/bankAccountVerification'
```

**Giải pháp:**

1. **Kiểm tra file có tồn tại:**
   ```bash
   ls backend/src/utils/bankAccountVerification.js
   ```

2. **Kiểm tra đường dẫn import:**
   - Đảm bảo đường dẫn đúng
   - Kiểm tra case-sensitive (Linux/Mac)

3. **Restart server:**
   ```bash
   npm restart
   ```

## 🔧 Các lệnh hữu ích

### Kiểm tra database connection

```bash
cd backend
npm run test-db
```

### Kiểm tra API

```bash
cd backend
npm run test-api
```

### Restart server

```bash
cd backend
npm run restart
```

### Xem log chi tiết

```bash
cd backend
npm start
# Hoặc
npm run dev  # Với nodemon (tự động restart khi có thay đổi)
```

## 📋 Checklist Debug

Khi gặp lỗi "Không thể kết nối đến server", kiểm tra:

- [ ] Backend server có đang chạy không?
  ```bash
  # Test health check
  curl http://localhost:5002/health
  ```

- [ ] Port có bị chiếm không?
  ```bash
  # Windows
  netstat -ano | findstr :5002
  
  # Linux/Mac
  lsof -i :5002
  ```

- [ ] Database có đang chạy không?
  ```bash
  npm run test-db
  ```

- [ ] Dependencies đã được cài đặt chưa?
  ```bash
  npm install
  ```

- [ ] File `.env` có đúng không?
  - Kiểm tra các biến: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
  - Hoặc DATABASE_URL (cho PostgreSQL)

- [ ] Có lỗi syntax trong code không?
  ```bash
  node scripts/check-backend.js
  ```

- [ ] Frontend có kết nối đúng URL không?
  - Kiểm tra file `frontend/lib/api.js`
  - Đảm bảo URL trỏ đến `http://localhost:5002/api`

## 🚀 Khởi động lại từ đầu

Nếu vẫn không được, thử khởi động lại từ đầu:

```bash
# 1. Dừng tất cả process node
# Windows
taskkill /F /IM node.exe

# Linux/Mac
pkill node

# 2. Xóa node_modules và cài lại
cd backend
rm -rf node_modules
npm install

# 3. Kiểm tra lại
node scripts/check-backend.js

# 4. Start server
npm start
```

## 📞 Lấy thông tin để báo lỗi

Nếu vẫn không giải quyết được, thu thập thông tin sau:

1. **Output của script kiểm tra:**
   ```bash
   node scripts/check-backend.js > check-output.txt
   ```

2. **Log khi start server:**
   ```bash
   npm start > server-log.txt 2>&1
   ```

3. **Thông tin hệ thống:**
   - OS: Windows/Linux/Mac
   - Node.js version: `node --version`
   - npm version: `npm --version`

4. **File `.env`** (xóa password trước khi gửi):
   ```env
   DB_HOST=...
   DB_PORT=...
   DB_USER=...
   # DB_PASSWORD=*** (không gửi)
   DB_NAME=...
   ```

## ✅ Kết luận

Sau khi kiểm tra các bước trên, bạn sẽ biết được:
- Server có đang chạy không
- Port có bị chiếm không
- Database có kết nối được không
- Code có lỗi syntax không

Nếu vẫn không giải quyết được, hãy gửi thông tin trên để được hỗ trợ thêm.



## 🔍 Kiểm tra nhanh

### Bước 1: Chạy script kiểm tra

```bash
cd backend
node scripts/check-backend.js
```

Script này sẽ kiểm tra:
- ✅ Các file quan trọng có lỗi syntax không
- ✅ Dependencies đã được cài đặt chưa
- ✅ Biến môi trường đã được set chưa
- ✅ Express app có load được không

### Bước 2: Kiểm tra server có đang chạy không

**Windows:**
```powershell
# Kiểm tra port 5002
netstat -ano | findstr :5002

# Hoặc kiểm tra process node
tasklist | findstr node
```

**Linux/Mac:**
```bash
# Kiểm tra port 5002
lsof -i :5002

# Hoặc
netstat -an | grep 5002
```

### Bước 3: Kiểm tra log khi start server

```bash
cd backend
npm start
```

Xem các thông báo:
- ✅ `Database connection established` - Database OK
- ✅ `Server running on http://0.0.0.0:5002` - Server OK
- ❌ Nếu có lỗi, xem chi tiết bên dưới

## 🐛 Các lỗi thường gặp

### 1. Lỗi "Cannot find module"

**Triệu chứng:**
```
Error: Cannot find module 'axios'
```

**Giải pháp:**
```bash
cd backend
npm install
```

### 2. Lỗi "Port already in use"

**Triệu chứng:**
```
❌ Port 5002 is already in use
```

**Giải pháp:**

**Windows:**
```powershell
# Tìm process đang dùng port
netstat -ano | findstr :5002

# Kill process (thay PID bằng số từ lệnh trên)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Tìm và kill process
lsof -ti:5002 | xargs kill -9
```

**Hoặc đổi port trong `.env`:**
```env
PORT=5003
```

### 3. Lỗi "Database connection failed"

**Triệu chứng:**
```
❌ Failed to start server: SequelizeConnectionError
```

**Giải pháp:**

1. **Kiểm tra database có đang chạy không:**
   - MySQL: Kiểm tra service MySQL
   - PostgreSQL: Kiểm tra service PostgreSQL

2. **Kiểm tra thông tin kết nối trong `.env`:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=menu_order_db
   ```

3. **Test kết nối:**
   ```bash
   cd backend
   npm run test-db
   ```

### 4. Lỗi "SyntaxError" hoặc "ReferenceError"

**Triệu chứng:**
```
SyntaxError: Unexpected token
ReferenceError: X is not defined
```

**Giải pháp:**

1. **Chạy script kiểm tra:**
   ```bash
   node scripts/check-backend.js
   ```

2. **Kiểm tra file có lỗi:**
   - Xem log để biết file nào bị lỗi
   - Kiểm tra syntax trong file đó

3. **Kiểm tra Node.js version:**
   ```bash
   node --version
   ```
   Cần Node.js 18+ 

### 5. Lỗi "Module not found" cho file mới

**Triệu chứng:**
```
Error: Cannot find module './utils/bankAccountVerification'
```

**Giải pháp:**

1. **Kiểm tra file có tồn tại:**
   ```bash
   ls backend/src/utils/bankAccountVerification.js
   ```

2. **Kiểm tra đường dẫn import:**
   - Đảm bảo đường dẫn đúng
   - Kiểm tra case-sensitive (Linux/Mac)

3. **Restart server:**
   ```bash
   npm restart
   ```

## 🔧 Các lệnh hữu ích

### Kiểm tra database connection

```bash
cd backend
npm run test-db
```

### Kiểm tra API

```bash
cd backend
npm run test-api
```

### Restart server

```bash
cd backend
npm run restart
```

### Xem log chi tiết

```bash
cd backend
npm start
# Hoặc
npm run dev  # Với nodemon (tự động restart khi có thay đổi)
```

## 📋 Checklist Debug

Khi gặp lỗi "Không thể kết nối đến server", kiểm tra:

- [ ] Backend server có đang chạy không?
  ```bash
  # Test health check
  curl http://localhost:5002/health
  ```

- [ ] Port có bị chiếm không?
  ```bash
  # Windows
  netstat -ano | findstr :5002
  
  # Linux/Mac
  lsof -i :5002
  ```

- [ ] Database có đang chạy không?
  ```bash
  npm run test-db
  ```

- [ ] Dependencies đã được cài đặt chưa?
  ```bash
  npm install
  ```

- [ ] File `.env` có đúng không?
  - Kiểm tra các biến: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
  - Hoặc DATABASE_URL (cho PostgreSQL)

- [ ] Có lỗi syntax trong code không?
  ```bash
  node scripts/check-backend.js
  ```

- [ ] Frontend có kết nối đúng URL không?
  - Kiểm tra file `frontend/lib/api.js`
  - Đảm bảo URL trỏ đến `http://localhost:5002/api`

## 🚀 Khởi động lại từ đầu

Nếu vẫn không được, thử khởi động lại từ đầu:

```bash
# 1. Dừng tất cả process node
# Windows
taskkill /F /IM node.exe

# Linux/Mac
pkill node

# 2. Xóa node_modules và cài lại
cd backend
rm -rf node_modules
npm install

# 3. Kiểm tra lại
node scripts/check-backend.js

# 4. Start server
npm start
```

## 📞 Lấy thông tin để báo lỗi

Nếu vẫn không giải quyết được, thu thập thông tin sau:

1. **Output của script kiểm tra:**
   ```bash
   node scripts/check-backend.js > check-output.txt
   ```

2. **Log khi start server:**
   ```bash
   npm start > server-log.txt 2>&1
   ```

3. **Thông tin hệ thống:**
   - OS: Windows/Linux/Mac
   - Node.js version: `node --version`
   - npm version: `npm --version`

4. **File `.env`** (xóa password trước khi gửi):
   ```env
   DB_HOST=...
   DB_PORT=...
   DB_USER=...
   # DB_PASSWORD=*** (không gửi)
   DB_NAME=...
   ```

## ✅ Kết luận

Sau khi kiểm tra các bước trên, bạn sẽ biết được:
- Server có đang chạy không
- Port có bị chiếm không
- Database có kết nối được không
- Code có lỗi syntax không

Nếu vẫn không giải quyết được, hãy gửi thông tin trên để được hỗ trợ thêm.



