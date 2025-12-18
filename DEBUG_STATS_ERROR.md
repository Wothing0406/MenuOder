# 🐛 Hướng Dẫn Debug Lỗi "Failed to get statistics"

## Vấn đề

Khi truy cập dashboard, thấy lỗi: **"Failed to get statistics"** hoặc dashboard hiển thị tất cả số liệu là 0.

## Nguyên nhân có thể

1. ❌ **Database connection issue** - Backend không kết nối được database
2. ❌ **Query syntax error** - SQL query không tương thích với PostgreSQL
3. ❌ **Missing data** - Chưa có đơn hàng với status = 'completed'
4. ❌ **Store not found** - User chưa có store được tạo
5. ❌ **Timezone issue** - Date comparison bị sai do timezone

## Cách Debug

### Bước 1: Kiểm tra Backend Logs trên Render

1. Vào [Render Dashboard](https://dashboard.render.com)
2. Chọn service backend của bạn
3. Vào tab **Logs**
4. Tìm các dòng có chứa:
   - `Get order stats error:`
   - `Database connection`
   - `Failed to get statistics`

**Lưu ý:** Nếu thấy lỗi database connection, kiểm tra:
- `DATABASE_URL` environment variable có đúng không
- Database có đang chạy không
- SSL connection có được cấu hình đúng không

### Bước 2: Test API trực tiếp

Test endpoint stats trực tiếp:

```bash
# Thay YOUR_BACKEND_URL và YOUR_TOKEN
curl -X GET "https://YOUR_BACKEND_URL.onrender.com/api/orders/my-store/stats" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Hoặc dùng Postman/Thunder Client để test.

### Bước 3: Chạy Script Test Local

Nếu có quyền truy cập local, chạy script test:

```bash
cd backend
node scripts/test-stats-query.js
```

Script này sẽ:
- Test kết nối database
- Test các query stats
- Hiển thị kết quả chi tiết

### Bước 4: Kiểm tra Database trực tiếp

Nếu có quyền truy cập database (qua Render Shell hoặc local):

```sql
-- Kiểm tra có store không
SELECT id, "storeName", "userId" FROM stores LIMIT 5;

-- Kiểm tra có đơn hàng completed không
SELECT COUNT(*) as total_orders, 
       COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders
FROM orders;

-- Kiểm tra đơn hàng completed của một store cụ thể
SELECT id, "orderCode", "totalAmount", status, "paymentMethod", "createdAt"
FROM orders 
WHERE status = 'completed' 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

### Bước 5: Kiểm tra Environment Variables

Đảm bảo các biến sau đã được set trên Render:

```env
DATABASE_URL=postgresql://...
NODE_ENV=production
```

## Các Fix đã được áp dụng

### 1. Sửa Query Syntax cho PostgreSQL

Code đã được cập nhật để:
- Tự động detect database dialect (PostgreSQL vs MySQL)
- Sử dụng quoted identifiers đúng cách cho PostgreSQL
- Thêm COALESCE để handle NULL values

### 2. Cải thiện Error Logging

Code giờ sẽ log:
- Full error message
- Error stack
- Original database error (nếu có)
- Error code từ database

### 3. Cải thiện Frontend Error Handling

Frontend giờ sẽ:
- Hiển thị error message rõ ràng hơn
- Log API URL để debug
- Hiển thị warning nếu API URL trỏ đến localhost

## Cách Fix Thủ Công

### Nếu vấn đề là Database Connection:

1. Vào Render Dashboard → Database
2. Kiểm tra database có đang chạy không
3. Copy lại `Internal Database URL` hoặc `Connection String`
4. Update `DATABASE_URL` trong backend service
5. Redeploy backend

### Nếu vấn đề là Query Syntax:

Code đã được fix, nhưng nếu vẫn lỗi:
1. Kiểm tra logs để xem exact SQL query
2. Test query trực tiếp trong database
3. Báo lại để tiếp tục fix

### Nếu vấn đề là Missing Data:

1. Tạo một đơn hàng test
2. Đảm bảo đơn hàng có status = 'completed'
3. Refresh dashboard

## Checklist Debug

- [ ] Backend đang chạy trên Render
- [ ] Database đang chạy và accessible
- [ ] `DATABASE_URL` đã được set đúng trên Render
- [ ] Backend logs không có lỗi connection
- [ ] Có ít nhất 1 store được tạo
- [ ] Có ít nhất 1 đơn hàng với status = 'completed'
- [ ] API endpoint `/orders/my-store/stats` trả về data khi test trực tiếp
- [ ] Frontend `NEXT_PUBLIC_API_URL` đã được set đúng trên Vercel

## Liên hệ

Nếu vẫn gặp vấn đề sau khi thử các bước trên:
1. Copy full error message từ backend logs
2. Copy response từ API test
3. Gửi thông tin để tiếp tục debug





