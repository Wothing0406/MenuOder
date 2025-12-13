# 🔧 Sửa Lỗi Render: Column "bankAccountNumber" does not exist

## ❌ Lỗi Gốc

```
error: column "bankAccountNumber" does not exist
code: '42703'
```

**Nguyên nhân:** 
- Model `Store` vẫn định nghĩa các cột bank transfer cũ (`bankAccountNumber`, `bankAccountName`, `bankName`, `bankCode`, `bankTransferQRIsActive`)
- Các cột này không còn trong database vì đã được chuyển sang bảng `payment_accounts`
- Sequelize tự động query tất cả các cột trong model, gây ra lỗi

## ✅ Các Thay Đổi Đã Thực Hiện

### 1. **Xóa Các Cột Bank Transfer Khỏi Model Store**
**File:** `backend/src/models/Store.js`

**Trước:**
```javascript
// Bank Transfer QR configuration
bankAccountNumber: { ... },
bankAccountName: { ... },
bankName: { ... },
bankCode: { ... },
bankTransferQRIsActive: { ... },
```

**Sau:**
```javascript
// Note: Bank transfer fields have been moved to payment_accounts table
// Do not add bank transfer fields here anymore
```

### 2. **Sửa storeController.js - Xóa Code Query Các Cột Cũ**
**File:** `backend/src/controllers/storeController.js`

**Thay đổi:**
- Xóa code lấy `bankTransferConfig` từ `storeData` (lines 190-197)
- Xóa các field bank transfer khỏi destructuring (line 216)
- Xóa code update bank transfer fields (lines 275-280)
- Thay bằng empty config để backward compatibility

**Trước:**
```javascript
storeData.bankTransferConfig = {
  isActive: storeData.bankTransferQRIsActive || false,
  accountNumber: storeData.bankAccountNumber || null,
  // ...
};
```

**Sau:**
```javascript
// Bank Transfer QR config - moved to payment_accounts table
storeData.bankTransferConfig = {
  isActive: false,
  accountNumber: null,
  accountName: null,
  bankName: null,
  bankCode: null
};
```

## 🚀 Cách Deploy Lên Render

### Bước 1: Commit và Push Code
```bash
git add .
git commit -m "Fix: Remove bank transfer fields from Store model"
git push
```

### Bước 2: Render Sẽ Tự Động Deploy
- Render sẽ tự động detect code mới và deploy
- Hoặc vào Render Dashboard → Manual Deploy

### Bước 3: Kiểm Tra Logs
Sau khi deploy, kiểm tra logs:
- Vào Render Dashboard → Logs
- Tìm dòng: `🔄 Running automatic migrations in production...`
- Xác nhận: `✅ Migrations completed`
- Kiểm tra không còn lỗi: `column "bankAccountNumber" does not exist`

## ✅ Kiểm Tra Sau Khi Deploy

1. **Test Login:**
   ```bash
   curl -X POST https://your-backend.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

2. **Test Get Store:**
   ```bash
   curl https://your-backend.onrender.com/api/stores/my-store \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Kiểm Tra Database:**
   - Đảm bảo bảng `payment_accounts` đã được tạo
   - Đảm bảo bảng `stores` không còn các cột bank transfer

## 📝 Lưu Ý

1. **Backward Compatibility:**
   - `bankTransferConfig` vẫn được trả về trong response nhưng sẽ là empty
   - Frontend nên sử dụng `/api/payment-accounts` endpoints thay vì `bankTransferConfig`

2. **Migration:**
   - Nếu database trên Render vẫn có các cột bank transfer trong bảng `stores`, có thể cần migration để xóa chúng
   - Nhưng không bắt buộc vì Sequelize sẽ không query chúng nữa

3. **Payment Accounts:**
   - Tất cả bank transfer accounts giờ được quản lý qua bảng `payment_accounts`
   - Sử dụng API: `/api/payment-accounts` để CRUD

## 🔍 Nếu Vẫn Còn Lỗi

1. **Kiểm tra code đã được deploy chưa:**
   - Vào Render Dashboard → Deployments
   - Xác nhận commit mới nhất đã được deploy

2. **Kiểm tra model Store:**
   ```bash
   # Vào Render Shell
   cd backend
   cat src/models/Store.js | grep -i "bankAccount"
   # Không nên có kết quả
   ```

3. **Clear cache (nếu có):**
   - Restart service trên Render
   - Hoặc đợi vài phút để cache expire

## ✅ Checklist

- [x] Xóa các cột bank transfer khỏi model Store
- [x] Sửa storeController để không query các cột cũ
- [x] Xóa code update bank transfer fields
- [ ] Deploy code mới lên Render
- [ ] Test login API
- [ ] Test get store API
- [ ] Kiểm tra logs không còn lỗi

