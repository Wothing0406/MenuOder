# Hướng dẫn lấy API Key VietQR

## 📋 Tổng quan

VietQR cung cấp API để tra cứu thông tin tài khoản ngân hàng, giúp xác thực tài khoản một cách tự động và chính xác.

## 🚀 Các bước lấy API Key

### Bước 1: Truy cập website VietQR

1. Mở trình duyệt và truy cập: **https://www.vietqr.io/**
2. Click vào **"My VietQR"** ở góc trên bên phải (hoặc đăng nhập nếu đã có tài khoản)

### Bước 2: Đăng ký tài khoản

Nếu chưa có tài khoản:

1. Click **"Đăng ký"** hoặc **"Sign Up"**
2. Điền thông tin:
   - Email
   - Mật khẩu
   - Xác nhận mật khẩu
3. Xác thực email (nếu yêu cầu)
4. Đăng nhập sau khi đăng ký thành công

### Bước 3: Tạo API Key

1. Sau khi đăng nhập, vào **"My VietQR"** hoặc **"Dashboard"**
2. Tìm mục **"API"** hoặc **"API Keys"** trong menu
3. Click **"Tạo API Key mới"** hoặc **"Create New API Key"**
4. Điền thông tin:
   - **Tên API Key**: Đặt tên dễ nhớ (VD: "MenuOrder Production", "MenuOrder Dev")
   - **Mô tả**: Mô tả ngắn về mục đích sử dụng
5. Click **"Tạo"** hoặc **"Create"**

### Bước 4: Lấy thông tin API

Sau khi tạo, bạn sẽ nhận được:

- **API ID** (Client ID): Mã định danh API
- **API Key**: Khóa bí mật để xác thực

⚠️ **LƯU Ý QUAN TRỌNG:**
- **Lưu ngay** API Key vì nó chỉ hiển thị một lần
- **Không chia sẻ** API Key với người khác
- Nếu quên, bạn sẽ phải tạo API Key mới

## 📝 Cấu hình vào hệ thống

### Cách 1: Thêm vào file `.env` (Khuyến nghị)

Mở file `.env` trong thư mục `backend` và thêm:

```env
# VietQR API Configuration
VIETQR_API_ID=your_api_id_here
VIETQR_API_KEY=your_api_key_here

# Optional: Strict mode - reject unverified accounts
STRICT_BANK_VERIFICATION=false
```

**Ví dụ:**
```env
VIETQR_API_ID=abc123xyz
VIETQR_API_KEY=sk_live_abcdefghijklmnopqrstuvwxyz1234567890
STRICT_BANK_VERIFICATION=false
```

### Cách 2: Thêm vào biến môi trường hệ thống

**Windows:**
```cmd
setx VIETQR_API_ID "your_api_id_here"
setx VIETQR_API_KEY "your_api_key_here"
```

**Linux/Mac:**
```bash
export VIETQR_API_ID="your_api_id_here"
export VIETQR_API_KEY="your_api_key_here"
```

## 🔍 Kiểm tra API Key

Sau khi cấu hình, khởi động lại backend server:

```bash
cd backend
npm start
```

Kiểm tra log để xem API key đã được load chưa. Nếu có lỗi, kiểm tra lại:
- Tên biến môi trường có đúng không
- API Key có đúng format không
- File `.env` có được load đúng không

## 📚 Tài liệu API VietQR

### Endpoint tra cứu tài khoản

```
GET https://api.vietqr.io/v2/lookup
```

**Parameters:**
- `bin`: Mã ngân hàng (BIN) - VD: 970415 (VietinBank)
- `accountNumber`: Số tài khoản

**Headers:**
- `x-client-id`: API ID của bạn
- `x-api-key`: API Key của bạn

**Ví dụ request:**
```bash
curl -X GET "https://api.vietqr.io/v2/lookup?bin=970415&accountNumber=113366668888" \
  -H "x-client-id: your_api_id" \
  -H "x-api-key: your_api_key"
```

**Response thành công:**
```json
{
  "code": "00",
  "desc": "Success",
  "data": {
    "accountName": "NGUYEN VAN A",
    "accountNumber": "113366668888",
    "bin": "970415"
  }
}
```

## 💡 Lưu ý quan trọng

### 1. Giới hạn API

- VietQR có thể có giới hạn số lượng request mỗi ngày/tháng
- Kiểm tra trong dashboard để xem giới hạn của bạn
- Sử dụng hợp lý để tránh vượt quá giới hạn

### 2. Bảo mật

- **KHÔNG** commit API Key vào Git
- Thêm `.env` vào `.gitignore`
- Sử dụng biến môi trường trong production
- Rotate API Key định kỳ nếu cần

### 3. Môi trường

- Tạo API Key riêng cho **Development** và **Production**
- Sử dụng API Key khác nhau cho mỗi môi trường
- Test kỹ trên môi trường dev trước khi dùng production

### 4. Chi phí

- Kiểm tra xem VietQR có tính phí không
- Xem bảng giá trong dashboard
- Có thể có gói miễn phí với giới hạn nhất định

## 🔧 Troubleshooting

### Lỗi "Invalid API Key"

**Nguyên nhân:**
- API Key sai hoặc đã hết hạn
- Tên biến môi trường sai

**Giải pháp:**
1. Kiểm tra lại API Key trong dashboard VietQR
2. Tạo API Key mới nếu cần
3. Kiểm tra file `.env` có đúng format không
4. Khởi động lại server sau khi cập nhật

### Lỗi "API Key not found"

**Nguyên nhân:**
- Biến môi trường chưa được set
- File `.env` chưa được load

**Giải pháp:**
1. Kiểm tra file `.env` có tồn tại không
2. Kiểm tra tên biến có đúng: `VIETQR_API_ID` và `VIETQR_API_KEY`
3. Đảm bảo `dotenv` đã được cấu hình trong code
4. Khởi động lại server

### Lỗi "Rate limit exceeded"

**Nguyên nhân:**
- Vượt quá giới hạn số lượng request

**Giải pháp:**
1. Kiểm tra giới hạn trong dashboard
2. Giảm số lượng request
3. Nâng cấp gói API nếu cần
4. Implement caching để giảm request

### Lỗi "Account not found"

**Nguyên nhân:**
- Số tài khoản không tồn tại
- Mã ngân hàng sai

**Giải pháp:**
1. Kiểm tra lại số tài khoản
2. Kiểm tra mã ngân hàng (BIN) có đúng không
3. Thử với tài khoản khác để test

## 📞 Hỗ trợ

Nếu gặp vấn đề:

1. **Xem tài liệu chính thức**: https://www.vietqr.io/docs
2. **Liên hệ hỗ trợ VietQR**: Qua email hoặc chat trong dashboard
3. **Kiểm tra log server**: Xem chi tiết lỗi trong console

## ✅ Checklist

Trước khi sử dụng, đảm bảo:

- [ ] Đã đăng ký tài khoản VietQR
- [ ] Đã tạo API Key thành công
- [ ] Đã lưu API ID và API Key an toàn
- [ ] Đã thêm vào file `.env`
- [ ] Đã khởi động lại server
- [ ] Đã test API hoạt động
- [ ] Đã thêm `.env` vào `.gitignore`

## 🎯 Kết luận

Sau khi hoàn thành các bước trên, hệ thống sẽ tự động:
- ✅ Xác thực tài khoản ngân hàng qua VietQR API
- ✅ So sánh tên chủ tài khoản tự động
- ✅ Từ chối các tài khoản không hợp lệ
- ✅ Cảnh báo khi không thể xác thực

Chúc bạn thành công! 🚀


## 📋 Tổng quan

VietQR cung cấp API để tra cứu thông tin tài khoản ngân hàng, giúp xác thực tài khoản một cách tự động và chính xác.

## 🚀 Các bước lấy API Key

### Bước 1: Truy cập website VietQR

1. Mở trình duyệt và truy cập: **https://www.vietqr.io/**
2. Click vào **"My VietQR"** ở góc trên bên phải (hoặc đăng nhập nếu đã có tài khoản)

### Bước 2: Đăng ký tài khoản

Nếu chưa có tài khoản:

1. Click **"Đăng ký"** hoặc **"Sign Up"**
2. Điền thông tin:
   - Email
   - Mật khẩu
   - Xác nhận mật khẩu
3. Xác thực email (nếu yêu cầu)
4. Đăng nhập sau khi đăng ký thành công

### Bước 3: Tạo API Key

1. Sau khi đăng nhập, vào **"My VietQR"** hoặc **"Dashboard"**
2. Tìm mục **"API"** hoặc **"API Keys"** trong menu
3. Click **"Tạo API Key mới"** hoặc **"Create New API Key"**
4. Điền thông tin:
   - **Tên API Key**: Đặt tên dễ nhớ (VD: "MenuOrder Production", "MenuOrder Dev")
   - **Mô tả**: Mô tả ngắn về mục đích sử dụng
5. Click **"Tạo"** hoặc **"Create"**

### Bước 4: Lấy thông tin API

Sau khi tạo, bạn sẽ nhận được:

- **API ID** (Client ID): Mã định danh API
- **API Key**: Khóa bí mật để xác thực

⚠️ **LƯU Ý QUAN TRỌNG:**
- **Lưu ngay** API Key vì nó chỉ hiển thị một lần
- **Không chia sẻ** API Key với người khác
- Nếu quên, bạn sẽ phải tạo API Key mới

## 📝 Cấu hình vào hệ thống

### Cách 1: Thêm vào file `.env` (Khuyến nghị)

Mở file `.env` trong thư mục `backend` và thêm:

```env
# VietQR API Configuration
VIETQR_API_ID=your_api_id_here
VIETQR_API_KEY=your_api_key_here

# Optional: Strict mode - reject unverified accounts
STRICT_BANK_VERIFICATION=false
```

**Ví dụ:**
```env
VIETQR_API_ID=abc123xyz
VIETQR_API_KEY=sk_live_abcdefghijklmnopqrstuvwxyz1234567890
STRICT_BANK_VERIFICATION=false
```

### Cách 2: Thêm vào biến môi trường hệ thống

**Windows:**
```cmd
setx VIETQR_API_ID "your_api_id_here"
setx VIETQR_API_KEY "your_api_key_here"
```

**Linux/Mac:**
```bash
export VIETQR_API_ID="your_api_id_here"
export VIETQR_API_KEY="your_api_key_here"
```

## 🔍 Kiểm tra API Key

Sau khi cấu hình, khởi động lại backend server:

```bash
cd backend
npm start
```

Kiểm tra log để xem API key đã được load chưa. Nếu có lỗi, kiểm tra lại:
- Tên biến môi trường có đúng không
- API Key có đúng format không
- File `.env` có được load đúng không

## 📚 Tài liệu API VietQR

### Endpoint tra cứu tài khoản

```
GET https://api.vietqr.io/v2/lookup
```

**Parameters:**
- `bin`: Mã ngân hàng (BIN) - VD: 970415 (VietinBank)
- `accountNumber`: Số tài khoản

**Headers:**
- `x-client-id`: API ID của bạn
- `x-api-key`: API Key của bạn

**Ví dụ request:**
```bash
curl -X GET "https://api.vietqr.io/v2/lookup?bin=970415&accountNumber=113366668888" \
  -H "x-client-id: your_api_id" \
  -H "x-api-key: your_api_key"
```

**Response thành công:**
```json
{
  "code": "00",
  "desc": "Success",
  "data": {
    "accountName": "NGUYEN VAN A",
    "accountNumber": "113366668888",
    "bin": "970415"
  }
}
```

## 💡 Lưu ý quan trọng

### 1. Giới hạn API

- VietQR có thể có giới hạn số lượng request mỗi ngày/tháng
- Kiểm tra trong dashboard để xem giới hạn của bạn
- Sử dụng hợp lý để tránh vượt quá giới hạn

### 2. Bảo mật

- **KHÔNG** commit API Key vào Git
- Thêm `.env` vào `.gitignore`
- Sử dụng biến môi trường trong production
- Rotate API Key định kỳ nếu cần

### 3. Môi trường

- Tạo API Key riêng cho **Development** và **Production**
- Sử dụng API Key khác nhau cho mỗi môi trường
- Test kỹ trên môi trường dev trước khi dùng production

### 4. Chi phí

- Kiểm tra xem VietQR có tính phí không
- Xem bảng giá trong dashboard
- Có thể có gói miễn phí với giới hạn nhất định

## 🔧 Troubleshooting

### Lỗi "Invalid API Key"

**Nguyên nhân:**
- API Key sai hoặc đã hết hạn
- Tên biến môi trường sai

**Giải pháp:**
1. Kiểm tra lại API Key trong dashboard VietQR
2. Tạo API Key mới nếu cần
3. Kiểm tra file `.env` có đúng format không
4. Khởi động lại server sau khi cập nhật

### Lỗi "API Key not found"

**Nguyên nhân:**
- Biến môi trường chưa được set
- File `.env` chưa được load

**Giải pháp:**
1. Kiểm tra file `.env` có tồn tại không
2. Kiểm tra tên biến có đúng: `VIETQR_API_ID` và `VIETQR_API_KEY`
3. Đảm bảo `dotenv` đã được cấu hình trong code
4. Khởi động lại server

### Lỗi "Rate limit exceeded"

**Nguyên nhân:**
- Vượt quá giới hạn số lượng request

**Giải pháp:**
1. Kiểm tra giới hạn trong dashboard
2. Giảm số lượng request
3. Nâng cấp gói API nếu cần
4. Implement caching để giảm request

### Lỗi "Account not found"

**Nguyên nhân:**
- Số tài khoản không tồn tại
- Mã ngân hàng sai

**Giải pháp:**
1. Kiểm tra lại số tài khoản
2. Kiểm tra mã ngân hàng (BIN) có đúng không
3. Thử với tài khoản khác để test

## 📞 Hỗ trợ

Nếu gặp vấn đề:

1. **Xem tài liệu chính thức**: https://www.vietqr.io/docs
2. **Liên hệ hỗ trợ VietQR**: Qua email hoặc chat trong dashboard
3. **Kiểm tra log server**: Xem chi tiết lỗi trong console

## ✅ Checklist

Trước khi sử dụng, đảm bảo:

- [ ] Đã đăng ký tài khoản VietQR
- [ ] Đã tạo API Key thành công
- [ ] Đã lưu API ID và API Key an toàn
- [ ] Đã thêm vào file `.env`
- [ ] Đã khởi động lại server
- [ ] Đã test API hoạt động
- [ ] Đã thêm `.env` vào `.gitignore`

## 🎯 Kết luận

Sau khi hoàn thành các bước trên, hệ thống sẽ tự động:
- ✅ Xác thực tài khoản ngân hàng qua VietQR API
- ✅ So sánh tên chủ tài khoản tự động
- ✅ Từ chối các tài khoản không hợp lệ
- ✅ Cảnh báo khi không thể xác thực

Chúc bạn thành công! 🚀

