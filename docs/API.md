# MenuOrder API Documentation

## Tổng Quan

API của MenuOrder được xây dựng theo chuẩn RESTful với JSON responses. Tất cả endpoints đều có authentication trừ public endpoints.

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

### JWT Token
Tất cả requests (trừ public) cần header:
```
Authorization: Bearer <jwt_token>
```

### Login Flow
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "store@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": { "id": 1, "email": "...", "role": "store_owner" },
    "token": "jwt_token_here",
    "store": { "id": 1, "storeName": "...", "storeSlug": "..." }
  }
}
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Đăng ký tài khoản | No |
| POST | `/auth/login` | Đăng nhập | No |
| GET | `/auth/me` | Thông tin user hiện tại | Yes |
| POST | `/auth/logout` | Đăng xuất | Yes |

### Stores
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/stores/:storeSlug` | Thông tin cửa hàng công khai | No |
| GET | `/stores` | Danh sách cửa hàng của user | Yes |
| POST | `/stores` | Tạo cửa hàng mới | Yes |
| PUT | `/stores/:id` | Cập nhật cửa hàng | Yes |
| DELETE | `/stores/:id` | Xóa cửa hàng | Yes |
| GET | `/stores/:id/qr` | Tạo QR code | Yes |

### Categories
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/categories?storeId=:id` | Danh sách danh mục | Yes |
| POST | `/categories` | Tạo danh mục | Yes |
| PUT | `/categories/:id` | Cập nhật danh mục | Yes |
| DELETE | `/categories/:id` | Xóa danh mục | Yes |

### Items
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/items?storeId=:id` | Danh sách món ăn | Yes |
| GET | `/items/public?storeId=:id` | Menu công khai | No |
| POST | `/items` | Tạo món ăn | Yes |
| PUT | `/items/:id` | Cập nhật món ăn | Yes |
| DELETE | `/items/:id` | Xóa món ăn | Yes |
| POST | `/items/:id/image` | Upload ảnh món | Yes |

### Item Options & Accompaniments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/item-options?itemId=:id` | Lấy tùy chọn món | No |
| POST | `/item-options` | Tạo tùy chọn | Yes |
| PUT | `/item-options/:id` | Cập nhật tùy chọn | Yes |
| DELETE | `/item-options/:id` | Xóa tùy chọn | Yes |

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/accompaniments?itemId=:id` | Lấy món kèm | No |
| POST | `/accompaniments` | Tạo món kèm | Yes |
| PUT | `/accompaniments/:id` | Cập nhật món kèm | Yes |
| DELETE | `/accompaniments/:id` | Xóa món kèm | Yes |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/orders?storeId=:id` | Danh sách đơn hàng | Yes |
| GET | `/orders/:id` | Chi tiết đơn hàng | Yes |
| PUT | `/orders/:id/status` | Cập nhật trạng thái | Yes |
| POST | `/orders/public` | Tạo đơn hàng (khách) | No |
| GET | `/orders/track/:code` | Theo dõi đơn hàng | No |

### Analytics
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/analytics/overview?storeId=:id&period=today|week|month|year` | Tổng quan | Yes |
| GET | `/analytics/revenue?storeId=:id&period=...` | Doanh thu | Yes |
| GET | `/analytics/orders?storeId=:id&period=...` | Thống kê đơn | Yes |

### Vouchers
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/vouchers?storeId=:id` | Danh sách voucher | Yes |
| POST | `/vouchers` | Tạo voucher | Yes |
| PUT | `/vouchers/:id` | Cập nhật voucher | Yes |
| DELETE | `/vouchers/:id` | Xóa voucher | Yes |
| POST | `/vouchers/validate` | Validate voucher | No |

### Payment
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/payment-accounts?storeId=:id` | Tài khoản thanh toán | Yes |
| POST | `/payment-accounts` | Tạo tài khoản | Yes |
| PUT | `/payment-accounts/:id` | Cập nhật | Yes |
| DELETE | `/payment-accounts/:id` | Xóa | Yes |

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/zalopay/create-order` | Tạo đơn ZaloPay | No |
| GET | `/zalopay/callback` | Callback ZaloPay | No |
| POST | `/bank-transfer/verify` | Verify chuyển khoản | No |

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { /* optional */ }
  }
}
```

### Pagination
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Dữ liệu đầu vào không hợp lệ |
| `UNAUTHORIZED` | Chưa đăng nhập |
| `FORBIDDEN` | Không có quyền truy cập |
| `NOT_FOUND` | Không tìm thấy resource |
| `CONFLICT` | Dữ liệu đã tồn tại |
| `INTERNAL_ERROR` | Lỗi server |

## Rate Limiting

- 100 requests per minute cho authenticated users
- 10 requests per minute cho public endpoints
- Headers: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Examples

### Tạo đơn hàng
```javascript
const orderData = {
  storeId: 1,
  customerName: "Nguyễn Văn A",
  customerPhone: "0123456789",
  orderType: "dine_in", // or "delivery"
  tableNumber: 5, // for dine_in
  items: [
    {
      itemId: 1,
      quantity: 2,
      selectedOptions: { size: "large", topping: ["cheese"] },
      notes: "Không cay"
    }
  ],
  paymentMethod: "cash"
};

fetch('/api/orders/public', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
});
```

### Upload ảnh món ăn
```javascript
const formData = new FormData();
formData.append('image', file);

fetch(`/api/items/${itemId}/image`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## Webhooks (Future)

Hệ thống hỗ trợ webhooks cho:
- Order status changes
- Payment confirmations
- New reviews

Format webhook:
```json
{
  "event": "order.status_changed",
  "data": { /* order data */ },
  "timestamp": "2024-01-01T00:00:00Z"
}
```








