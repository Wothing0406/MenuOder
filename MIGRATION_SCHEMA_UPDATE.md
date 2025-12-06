# 🔄 Cập Nhật Schema và Migration Dữ Liệu

## Câu Hỏi: Bảng Mới và Cột Mới Có Được Cập Nhật Không?

### ✅ Trả Lời Ngắn Gọn

**CÓ!** Script migration đã được cải thiện để xử lý cả bảng mới và cột mới:

1. **Bảng mới**: ✅ Sẽ được tạo tự động
2. **Cột mới**: ✅ Sẽ được thêm vào bảng đã tồn tại
3. **Dữ liệu cũ**: ✅ Được giữ nguyên, không bị mất

## 🔍 Chi Tiết

### Cách Script Xử Lý

Script migration (`migrate-database.js`) sẽ:

1. **Sync Schema với `alter: true`**:
   - Tạo bảng mới nếu chưa có
   - Thêm cột mới vào bảng đã tồn tại
   - **KHÔNG xóa** bảng hoặc cột cũ (vì `force: false`)

2. **Copy Dữ Liệu Thông Minh**:
   - Chỉ copy các cột có trong cả database cũ VÀ mới
   - Bỏ qua các cột không tồn tại trong bảng mới
   - Tự động xử lý các kiểu dữ liệu (Date, JSON, etc.)

### Ví Dụ Cụ Thể

#### Trường Hợp 1: Cột Mới Trong Model

**Database cũ:**
```sql
stores table:
- id
- storeName
- storeAddress
```

**Database mới (sau khi sync):**
```sql
stores table:
- id
- storeName
- storeAddress
- storeGoogleMapLink  ← Cột mới được thêm
- storeDetailedAddress ← Cột mới được thêm
```

**Kết quả:**
- ✅ Cột mới được thêm vào bảng
- ✅ Dữ liệu cũ vẫn được giữ nguyên
- ✅ Cột mới sẽ có giá trị `NULL` cho các bản ghi cũ

#### Trường Hợp 2: Bảng Mới

**Database cũ:**
- Không có bảng `reviews`

**Database mới (sau khi sync):**
- Bảng `reviews` được tạo tự động
- Có thể copy dữ liệu nếu có trong database cũ

#### Trường Hợp 3: Cột Cũ Không Còn Trong Model

**Database cũ:**
```sql
stores table:
- id
- storeName
- oldColumn  ← Cột cũ không còn trong model mới
```

**Database mới:**
```sql
stores table:
- id
- storeName
```

**Kết quả:**
- ✅ Cột cũ không được copy (vì không có trong model mới)
- ✅ Dữ liệu các cột khác vẫn được copy bình thường

## 📋 Quy Trình Migration

### Bước 1: Sync Schema (Tự Động)

Script sẽ tự động sync schema trước khi copy dữ liệu:

```javascript
await newSequelize.sync({ 
  alter: true,  // Thêm cột mới
  force: false   // Không xóa dữ liệu
});
```

### Bước 2: Copy Dữ Liệu

Sau khi schema đã được sync, script sẽ:
- Copy dữ liệu từ database cũ
- Chỉ copy các cột có trong cả hai database
- Tự động xử lý các kiểu dữ liệu

## ⚠️ Lưu Ý Quan Trọng

### 1. Cột Mới Sẽ Có Giá Trị NULL

Nếu bạn thêm cột mới vào model và chạy migration:
- Các bản ghi cũ sẽ có giá trị `NULL` cho cột mới
- Bạn cần cập nhật dữ liệu sau nếu cần

### 2. Cột Cũ Sẽ Bị Bỏ Qua

Nếu bạn xóa cột khỏi model:
- Dữ liệu cột đó sẽ KHÔNG được copy
- Nhưng cột vẫn tồn tại trong database (Sequelize không xóa cột với `alter: true`)

### 3. Thay Đổi Kiểu Dữ Liệu

Nếu bạn thay đổi kiểu dữ liệu của cột:
- Sequelize có thể không tự động convert
- Cần migration thủ công nếu cần

## 🔧 Nếu Cần Thêm Cột Thủ Công

Nếu bạn muốn thêm cột với giá trị mặc định cho dữ liệu cũ:

```sql
-- Ví dụ: Thêm cột với giá trị mặc định
ALTER TABLE stores 
ADD COLUMN storeGoogleMapLink VARCHAR(500) NULL DEFAULT NULL;

-- Hoặc với giá trị mặc định
ALTER TABLE stores 
ADD COLUMN isFeatured BOOLEAN DEFAULT false;
```

## ✅ Checklist

Trước khi migration, đảm bảo:

- [ ] Models đã được cập nhật với bảng/cột mới
- [ ] Đã backup database cũ
- [ ] Đã test sync schema trên database test trước
- [ ] Hiểu rõ các thay đổi schema sẽ ảnh hưởng như thế nào

## 🎯 Kết Luận

**Script migration đã được cải thiện để tự động xử lý:**
- ✅ Tạo bảng mới
- ✅ Thêm cột mới
- ✅ Copy dữ liệu thông minh
- ✅ Giữ nguyên dữ liệu cũ

**Bạn chỉ cần:**
1. Cập nhật models với bảng/cột mới
2. Chạy script migration
3. Kiểm tra kết quả

---

**Chúc bạn migration thành công! 🎉**

