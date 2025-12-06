# Hướng Dẫn Migration Database Lên Render PostgreSQL

Hướng dẫn này sẽ giúp bạn di chuyển dữ liệu từ database hiện tại sang database PostgreSQL mới trên Render mà **KHÔNG MẤT DỮ LIỆU**.

## 📋 Yêu Cầu

1. Database cũ vẫn đang hoạt động và có thể truy cập
2. Database mới trên Render đã được tạo
3. Connection string của database mới:
   ```
   postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a/menu_order_db_wfa4
   ```

## 🔧 Các Bước Thực Hiện

### Bước 1: Backup Database Cũ (QUAN TRỌNG!)

**Trước khi làm bất cứ điều gì, hãy backup database cũ của bạn!**

#### Nếu dùng MySQL:
```bash
mysqldump -u [username] -p [database_name] > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Nếu dùng PostgreSQL:
```bash
pg_dump [database_url] > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Bước 2: Đảm Bảo Schema Đã Được Tạo Trên Database Mới

Database mới trên Render cần có schema (các bảng) trước khi copy dữ liệu.

**Cách 1: Sử dụng Sequelize sync (Khuyến nghị)**
```bash
# Tạm thời cập nhật DATABASE_URL trong .env để trỏ đến database mới
# Sau đó chạy server để sync schema
npm start
```

**Cách 2: Chạy migration script có sẵn**
```bash
# Nếu có script migration
npm run apply-migration
```

### Bước 3: Cấu Hình Script Migration

1. Mở file `backend/src/.env` (hoặc `.env` trong thư mục backend)
2. Đảm bảo các biến môi trường cho database cũ vẫn còn:
   - `DATABASE_URL` (nếu dùng connection string)
   - HOẶC `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_TYPE`

3. Thêm biến môi trường cho database mới (tùy chọn):
   ```env
   NEW_DATABASE_URL=postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a/menu_order_db_wfa4
   ```

   **Lưu ý:** Nếu không set `NEW_DATABASE_URL`, script sẽ dùng connection string mặc định.

### Bước 4: Chạy Script Migration

```bash
cd backend
node scripts/migrate-database.js
```

Script sẽ:
- ✅ Kết nối với database cũ
- ✅ Kết nối với database mới
- ✅ Copy tất cả dữ liệu từng bảng theo thứ tự phụ thuộc
- ✅ Bỏ qua các bản ghi đã tồn tại (không ghi đè)
- ✅ Reset sequences cho PostgreSQL

### Bước 5: Kiểm Tra Dữ Liệu

Sau khi migration xong, kiểm tra:

1. **Kết nối với database mới và kiểm tra số lượng bản ghi:**
   ```sql
   SELECT 
     'users' as table_name, COUNT(*) as count FROM users
   UNION ALL
   SELECT 'stores', COUNT(*) FROM stores
   UNION ALL
   SELECT 'categories', COUNT(*) FROM categories
   UNION ALL
   SELECT 'items', COUNT(*) FROM items
   UNION ALL
   SELECT 'orders', COUNT(*) FROM orders;
   ```

2. **So sánh với database cũ** để đảm bảo số lượng khớp.

3. **Kiểm tra một vài bản ghi cụ thể** để đảm bảo dữ liệu đúng.

### Bước 6: Cập Nhật Cấu Hình Ứng Dụng

Sau khi đã xác nhận dữ liệu đã được copy đầy đủ:

1. **Cập nhật file `.env`:**
   ```env
   DATABASE_URL=postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a/menu_order_db_wfa4
   NODE_ENV=production
   ```

2. **Hoặc nếu dùng các biến riêng lẻ:**
   ```env
   DB_TYPE=postgres
   DB_HOST=dpg-d4j8lg6uk2gs73bfdtqg-a
   DB_PORT=5432
   DB_NAME=menu_order_db_wfa4
   DB_USER=menu_order_db_wfa4_user
   DB_PASSWORD=YOuvv1yii0cC34ukdDhzY2rtM88p3pPL
   ```

3. **Test lại ứng dụng:**
   ```bash
   npm start
   ```

### Bước 7: Cập Nhật Trên Render (Nếu Deploy)

Nếu bạn đang deploy trên Render:

**Xem hướng dẫn chi tiết trong file `RENDER_SETUP_GUIDE.md`**

Tóm tắt nhanh:
1. Vào **Dashboard Render** → **Services** → Chọn service backend
2. Vào tab **Environment** → Thêm/cập nhật:
   - `DATABASE_URL` = connection string mới
   - `NODE_ENV` = `production`
3. **Link database** với service (nếu chưa link) trong tab **Connections**
4. **Restart service** để áp dụng thay đổi
5. Kiểm tra **Logs** để đảm bảo kết nối thành công

## ⚠️ Lưu Ý Quan Trọng

1. **KHÔNG XÓA DATABASE CŨ** ngay lập tức. Giữ lại ít nhất 1-2 tuần để đảm bảo mọi thứ hoạt động tốt.

2. **Test kỹ ứng dụng** sau khi migration để đảm bảo:
   - Đăng nhập/đăng ký hoạt động
   - Tạo/sửa/xóa store hoạt động
   - Tạo/sửa/xóa items hoạt động
   - Đặt hàng hoạt động
   - Tất cả các tính năng khác hoạt động bình thường

3. **Nếu có lỗi**, bạn có thể:
   - Chạy lại script migration (an toàn, không ghi đè dữ liệu đã có)
   - Hoặc khôi phục từ backup và thử lại

## 🔍 Troubleshooting

### Lỗi: "Table does not exist"
- **Nguyên nhân:** Schema chưa được tạo trên database mới
- **Giải pháp:** Chạy sync database trước (xem Bước 2)

### Lỗi: "Connection refused" hoặc "Connection timeout"
- **Nguyên nhân:** Database mới chưa cho phép kết nối từ IP của bạn
- **Giải pháp:** 
  - Kiểm tra firewall settings trên Render
  - Đảm bảo connection string đúng
  - Thử kết nối từ máy khác hoặc từ Render service

### Lỗi: "Duplicate key" hoặc "Unique constraint violation"
- **Nguyên nhân:** Dữ liệu đã tồn tại
- **Giải pháp:** Script sẽ tự động bỏ qua các bản ghi trùng lặp, đây là hành vi bình thường

### Dữ liệu không khớp
- **Nguyên nhân:** Có thể một số bảng chưa được copy
- **Giải pháp:** Chạy lại script migration, nó sẽ chỉ copy các bản ghi chưa tồn tại

## 📞 Hỗ Trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra logs của script migration
2. Kiểm tra connection strings
3. Đảm bảo cả hai database đều có thể truy cập
4. Backup và thử lại

## ✅ Checklist

- [ ] Đã backup database cũ
- [ ] Đã tạo schema trên database mới
- [ ] Đã cấu hình script migration
- [ ] Đã chạy script migration thành công
- [ ] Đã kiểm tra dữ liệu trên database mới
- [ ] Đã cập nhật cấu hình ứng dụng
- [ ] Đã test ứng dụng hoạt động bình thường
- [ ] Đã cập nhật cấu hình trên Render (nếu có)
- [ ] Đã giữ lại database cũ để backup

---

**Chúc bạn migration thành công! 🎉**

