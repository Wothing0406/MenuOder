# Xử lý khi VietQR Free Plan hết hạn

## Vấn đề

Khi thấy thông báo: **"The Free Plan will no longer support from August 20, 2024"** hoặc **"ℹ️ The Free Plan will no longer support from August 20, 2024"**

Điều này có nghĩa là:
- Có thể bạn đang sử dụng API key từ gói cũ (Free Plan đã hết hạn từ 20/8/2024)
- Hoặc API key không hợp lệ/đã hết hạn
- Theo [VietQR.io](https://www.vietqr.io/), hiện tại vẫn có gói **Registered** (miễn phí) với tính năng Account Number Lookup
- Bạn có thể đăng ký tài khoản mới để lấy API key mới, hoặc sử dụng chế độ không xác thực

## Giải pháp

### Giải pháp 1: Vẫn tạo tài khoản (Khuyến nghị)

**Hệ thống vẫn cho phép bạn tạo tài khoản ngân hàng** ngay cả khi Free Plan đã hết hạn:

1. **Nhập thông tin tài khoản:**
   - Số tài khoản: `0795277227` (hoặc số tài khoản của bạn)
   - Tên chủ tài khoản: Nhập tên chủ tài khoản
   - Tên ngân hàng: Chọn ngân hàng

2. **Bỏ qua thông báo Free Plan:**
   - Thông báo này chỉ là cảnh báo
   - Bạn vẫn có thể click **"Lưu và liên kết"**
   - Tài khoản sẽ được tạo với trạng thái **"Chưa xác thực"** (`isVerified = false`)

3. **Sử dụng tài khoản:**
   - Tài khoản vẫn hoạt động bình thường
   - Vẫn có thể tạo QR code thanh toán
   - Chỉ khác là không có xác thực tự động từ VietQR

### Giải pháp 2: Đăng ký tài khoản VietQR mới (Khuyến nghị)

Theo [trang chủ VietQR.io](https://www.vietqr.io/), gói **Registered** vẫn **MIỄN PHÍ** và bao gồm tính năng **Account Number Lookup**:

1. **Truy cập VietQR:**
   - Vào: https://www.vietqr.io/
   - Click **"My VietQR"** ở góc trên bên phải

2. **Đăng ký tài khoản mới:**
   - Nếu chưa có tài khoản, click **"Đăng ký"** hoặc **"Sign Up"**
   - Điền thông tin và xác thực email
   - Đăng nhập sau khi đăng ký thành công

3. **Lấy API Key mới:**
   - Vào **"My VietQR"** → **"API"** hoặc **"API Keys"**
   - Tạo API Key mới
   - **Lưu ngay** `API ID` và `API Key` (chỉ hiển thị một lần)

4. **Cập nhật vào `.env`:**
   ```env
   VIETQR_API_ID=your_new_api_id
   VIETQR_API_KEY=your_new_api_key
   ```

5. **Khởi động lại backend:**
   ```bash
   cd backend
   npm start
   ```

### Giải pháp 3: Nâng cấp lên gói trả phí (Nếu cần tính năng cao cấp)

Nếu bạn muốn sử dụng tính năng xác thực tự động:

1. **Truy cập VietQR:**
   - Vào: https://www.vietqr.io/
   - Click **"My VietQR"** ở góc trên bên phải
   - Đăng nhập vào tài khoản (hoặc đăng ký nếu chưa có)

2. **Kiểm tra gói hiện tại:**
   - Theo [trang chủ VietQR.io](https://www.vietqr.io/), có các gói:
     - **Public Access**: Miễn phí, không cần đăng ký
     - **Registered**: Miễn phí, cần đăng ký tài khoản (bao gồm Account Number Lookup)
     - **Verified Company**: Liên hệ để biết giá
     - **Self-Hosted**: Liên hệ để biết giá
   
3. **Nâng cấp gói (nếu cần):**
   - Nếu đang dùng **Registered** (miễn phí) và cần tính năng cao cấp hơn
   - Liên hệ VietQR để nâng cấp lên **Verified Company**
   - Hoặc kiểm tra trong dashboard xem có tùy chọn nâng cấp không

3. **Cập nhật API Key:**
   - Lấy API Key mới từ gói đã nâng cấp
   - Cập nhật vào file `.env`:
     ```env
     VIETQR_API_ID=your_new_api_id
     VIETQR_API_KEY=your_new_api_key
     ```

4. **Khởi động lại backend:**
   ```bash
   cd backend
   npm start
   ```

### Giải pháp 4: Tắt xác thực tự động (Tạm thời)

Nếu không muốn sử dụng VietQR API:

1. **Xóa hoặc comment API keys trong `.env`:**
   ```env
   # VIETQR_API_ID=your_api_id
   # VIETQR_API_KEY=your_api_key
   ```

2. **Hệ thống sẽ:**
   - Chỉ thực hiện validation cơ bản (format, độ dài)
   - Không gọi API VietQR
   - Cho phép tạo tài khoản với `isVerified = false`

## Cách hoạt động hiện tại

Sau khi cập nhật code:

1. **Khi gặp lỗi Free Plan:**
   - Hệ thống tự động phát hiện thông báo "Free Plan"
   - Trả về `success: true` nhưng `verified: false`
   - Cho phép tạo tài khoản với cảnh báo

2. **Thông báo hiển thị:**
   - "Gói Free Plan của VietQR đã hết hạn. Bạn vẫn có thể tạo tài khoản nhưng sẽ được đánh dấu là chưa xác thực."
   - "Để xác thực tự động, vui lòng nâng cấp gói VietQR hoặc nhập thông tin tài khoản thủ công."

3. **Tài khoản được tạo:**
   - `isVerified = false` (chưa xác thực)
   - `verificationError = "Free Plan expired message"`
   - Vẫn hoạt động bình thường cho thanh toán

## Lưu ý

### Ưu điểm của chế độ không xác thực:
- ✅ Vẫn có thể tạo và sử dụng tài khoản
- ✅ Vẫn tạo được QR code thanh toán
- ✅ Không cần trả phí cho VietQR
- ✅ Hoạt động độc lập

### Nhược điểm:
- ❌ Không có xác thực tự động tên chủ tài khoản
- ❌ Phải nhập thủ công và kiểm tra cẩn thận
- ❌ Có thể có rủi ro nếu nhập sai thông tin

## Khuyến nghị

1. **Cho môi trường Development/Testing:**
   - Sử dụng chế độ không xác thực (bỏ qua Free Plan warning)
   - Đủ để test tính năng

2. **Cho môi trường Production:**
   - Nên nâng cấp lên gói trả phí VietQR
   - Hoặc kiểm tra thủ công thông tin tài khoản cẩn thận
   - Đảm bảo thông tin chính xác trước khi sử dụng

## Kiểm tra

Sau khi cập nhật code, thử lại:

1. Nhập số tài khoản: `0795277227`
2. Chọn ngân hàng: MB Bank
3. Xem thông báo (có thể vẫn hiển thị Free Plan warning)
4. Click **"Lưu và liên kết"** → Tài khoản sẽ được tạo thành công

## Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề:
- Kiểm tra log backend để xem chi tiết lỗi
- Đảm bảo `STRICT_BANK_VERIFICATION=false` trong `.env`
- Thử tạo tài khoản với thông tin đúng và kiểm tra thủ công

