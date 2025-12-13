# 🔧 Sửa Lỗi Dữ Liệu Biến Mất

## ❌ Vấn Đề

Dữ liệu như danh mục, món, đơn hàng gần đây tự dưng biến mất dần.

## 🔍 Nguyên Nhân Có Thể

### 1. Sequelize Sync Settings (Đã Kiểm Tra - AN TOÀN)

Trong `backend/src/index.js`:
```javascript
await sequelize.sync({ alter: false, force: false });
```

✅ **Đã an toàn:** `force: false` và `alter: false` - **KHÔNG xóa dữ liệu**

### 2. Foreign Key Constraints với ON DELETE CASCADE

Một số bảng có `ON DELETE CASCADE`:
- `categories` → Khi xóa store, categories cũng bị xóa
- `items` → Khi xóa category, items cũng bị xóa

⚠️ **Lưu ý:** Đây là hành vi bình thường khi xóa store/category có chủ ý.

### 3. Database Connection Issues

Nếu database connection bị ngắt, có thể:
- Dữ liệu không được lưu
- Query trả về empty results

### 4. Cache Issues

Frontend cache có thể hiển thị dữ liệu cũ hoặc không hiển thị dữ liệu mới.

## ✅ Giải Pháp

### Bước 1: Kiểm Tra Database Connection

Vào **Render Dashboard** → **Logs**, tìm:
- ❌ `Database connection error`
- ❌ `Connection timeout`
- ✅ `Database connection established`

### Bước 2: Kiểm Tra Sequelize Sync

Đảm bảo trong `backend/src/index.js`:
```javascript
await sequelize.sync({ alter: false, force: false });
```

**KHÔNG BAO GIỜ** dùng:
- ❌ `force: true` - Sẽ xóa TẤT CẢ dữ liệu
- ❌ `alter: true` - Có thể gây vấn đề với dữ liệu hiện có

### Bước 3: Kiểm Tra Logs

Vào **Render Dashboard** → **Logs**, tìm:
- `DELETE FROM` - Xem có query xóa không mong muốn không
- `TRUNCATE` - Xem có truncate table không
- `DROP TABLE` - Xem có drop table không

### Bước 4: Backup Database Thường Xuyên

```bash
# Trên Render Shell
cd backend
npm run backup
```

### Bước 5: Kiểm Tra Foreign Key Constraints

Nếu dữ liệu biến mất khi xóa category/store:
- Đây là hành vi bình thường với `ON DELETE CASCADE`
- Nếu muốn giữ lại dữ liệu, cần thay đổi foreign key constraint

## 🔒 Bảo Vệ Dữ Liệu

### 1. Đảm Bảo Sequelize Sync An Toàn

File: `backend/src/index.js`
```javascript
// ✅ ĐÚNG - An toàn
await sequelize.sync({ alter: false, force: false });

// ❌ SAI - Nguy hiểm
await sequelize.sync({ alter: true, force: false });
await sequelize.sync({ alter: false, force: true }); // XÓA TẤT CẢ!
```

### 2. Không Chạy Reset Script Trong Production

❌ **KHÔNG BAO GIỜ** chạy:
- `npm run reset-db` trong production
- Scripts có `DROP TABLE` hoặc `TRUNCATE`

### 3. Kiểm Tra Environment Variables

Đảm bảo:
- `NODE_ENV=production` trên Render
- Không có script tự động reset database

## 🆘 Nếu Dữ Liệu Đã Bị Mất

### Option 1: Restore từ Backup

Nếu có backup:
```bash
# Trên Render Shell
cd backend
# Upload backup file và restore
psql $DATABASE_URL < backup.sql
```

### Option 2: Kiểm Tra Render Database

1. Vào **Render Dashboard** → **PostgreSQL Database**
2. Click **"Connect"** → **"External Connection"**
3. Kiểm tra dữ liệu trong database

### Option 3: Liên Hệ Render Support

Nếu dữ liệu biến mất không rõ nguyên nhân, liên hệ Render support.

## 📋 Checklist Bảo Vệ Dữ Liệu

- [ ] `sequelize.sync({ alter: false, force: false })` - ✅ Đã đúng
- [ ] Không có script tự động reset database
- [ ] Database connection ổn định
- [ ] Backup database thường xuyên
- [ ] Kiểm tra logs không có DELETE/TRUNCATE/DROP không mong muốn
- [ ] Environment Variables đúng (NODE_ENV=production)

## 🔍 Debug

Nếu vẫn gặp vấn đề, kiểm tra:

1. **Render Logs:**
   ```
   Render Dashboard → Logs → Tìm "DELETE", "TRUNCATE", "DROP"
   ```

2. **Database Queries:**
   ```sql
   -- Kiểm tra số lượng records
   SELECT COUNT(*) FROM categories;
   SELECT COUNT(*) FROM items;
   SELECT COUNT(*) FROM orders;
   ```

3. **Foreign Key Constraints:**
   ```sql
   -- PostgreSQL
   SELECT * FROM information_schema.table_constraints 
   WHERE constraint_type = 'FOREIGN KEY';
   ```

---

**Nếu vẫn gặp vấn đề, vui lòng cung cấp:**
- Render logs
- Database connection status
- Thời điểm dữ liệu biến mất
- Các thao tác trước khi dữ liệu biến mất

