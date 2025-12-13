# Hướng dẫn xác thực tài khoản ngân hàng

## Tổng quan

Hệ thống đã được tích hợp tính năng xác thực tài khoản ngân hàng để đảm bảo chỉ cho phép liên kết các tài khoản hợp lệ, tránh các tài khoản giả mạo.

## Tính năng

- ✅ Xác thực tài khoản ngân hàng qua VietQR API
- ✅ So sánh tên chủ tài khoản tự động
- ✅ Kiểm tra format số tài khoản
- ✅ Hỗ trợ hơn 30 ngân hàng tại Việt Nam
- ✅ Fallback validation khi không có API key

## Cấu hình API Key VietQR

> 📖 **Xem hướng dẫn chi tiết**: [Hướng dẫn lấy API Key VietQR](./HUONG_DAN_LAY_API_VIETQR.md)

### Bước 1: Đăng ký tài khoản VietQR

1. Truy cập: https://www.vietqr.io/
2. Click **"My VietQR"** ở góc trên bên phải
3. Đăng ký tài khoản mới (nếu chưa có)
4. Đăng nhập vào dashboard

### Bước 2: Tạo API Key

1. Vào mục **"API"** hoặc **"API Keys"** trong dashboard
2. Click **"Tạo API Key mới"** hoặc **"Create New API Key"**
3. Điền thông tin và tạo
4. **Lưu ngay** `API ID` và `API Key` (chỉ hiển thị một lần)

### Bước 2: Cấu hình biến môi trường

Thêm vào file `.env` của bạn:

```env
# VietQR API Configuration
VIETQR_API_ID=your_api_id_here
VIETQR_API_KEY=your_api_key_here

# Optional: Strict mode - reject unverified accounts
# Set to 'true' to require account verification before linking
STRICT_BANK_VERIFICATION=false
```

### Bước 3: Khởi động lại server

Sau khi cấu hình, khởi động lại backend server để áp dụng thay đổi.

## Cách hoạt động

### Khi có API Key

1. **Người dùng nhập thông tin tài khoản:**
   - Số tài khoản
   - Tên chủ tài khoản
   - Tên ngân hàng

2. **Hệ thống tự động:**
   - Kiểm tra format số tài khoản (8-19 chữ số)
   - Gọi VietQR API để tra cứu tên chủ tài khoản
   - So sánh tên chủ tài khoản (độ tương đồng ≥ 70%)
   - Xác thực tài khoản nếu khớp

3. **Kết quả:**
   - ✅ **Xác thực thành công**: Tài khoản được đánh dấu `isVerified = true`
   - ❌ **Xác thực thất bại**: Hiển thị lỗi và yêu cầu kiểm tra lại

### Khi không có API Key

Hệ thống sẽ thực hiện:
- Kiểm tra format số tài khoản cơ bản
- Kiểm tra độ dài tên chủ tài khoản
- Đánh dấu tài khoản là `isVerified = false` với cảnh báo

## Chế độ Strict Mode

Khi bật `STRICT_BANK_VERIFICATION=true`:
- Chỉ cho phép liên kết tài khoản đã được xác thực thành công
- Từ chối các tài khoản không thể xác thực

Khi tắt (mặc định):
- Cho phép liên kết tài khoản chưa xác thực
- Hiển thị cảnh báo cho người dùng
- Tài khoản được đánh dấu `isVerified = false`

## API Endpoints

### Tra cứu tên chủ tài khoản

```
GET /api/bank-transfer/lookup-account-name?accountNumber=1234567890&bankCode=970436
```

**Response:**
```json
{
  "success": true,
  "accountName": "NGUYEN VAN A",
  "available": true
}
```

## Xử lý lỗi

### Lỗi thường gặp

1. **"Không tìm thấy thông tin tài khoản"**
   - Kiểm tra lại số tài khoản và mã ngân hàng
   - Đảm bảo tài khoản đang hoạt động

2. **"Tên chủ tài khoản không khớp"**
   - Nhập đúng tên chủ tài khoản (viết hoa, không dấu)
   - Kiểm tra lại thông tin với ngân hàng

3. **"Lỗi xác thực API VietQR"**
   - Kiểm tra API key và API ID
   - Đảm bảo tài khoản VietQR còn hiệu lực

## Lưu ý

- API VietQR có giới hạn số lượng request. Vui lòng sử dụng hợp lý.
- Tên chủ tài khoản thường được lưu dạng viết hoa, không dấu.
- Hệ thống sử dụng thuật toán so sánh tên linh hoạt (70% tương đồng) để xử lý các trường hợp viết tắt hoặc sai chính tả nhỏ.

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra log server để xem chi tiết lỗi
2. Xác minh cấu hình API key
3. Liên hệ hỗ trợ kỹ thuật

