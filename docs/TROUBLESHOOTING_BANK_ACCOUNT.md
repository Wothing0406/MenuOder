# Khắc phục lỗi khi thêm tài khoản ngân hàng

## Lỗi: "Không tìm thấy tài khoản với số tài khoản và mã ngân hàng này"

### Nguyên nhân

Lỗi này xảy ra khi VietQR API không tìm thấy thông tin tài khoản ngân hàng với số tài khoản và mã ngân hàng bạn cung cấp.

### Các nguyên nhân có thể:

1. **Số tài khoản không đúng**
   - Kiểm tra lại số tài khoản có đúng không
   - Đảm bảo không có khoảng trắng hoặc ký tự đặc biệt

2. **Mã ngân hàng không đúng**
   - Kiểm tra lại tên ngân hàng đã được chọn đúng chưa
   - Mã ngân hàng (BIN) phải khớp với ngân hàng thực tế

3. **Tài khoản không hỗ trợ tra cứu**
   - Một số loại tài khoản có thể không được hỗ trợ tra cứu qua VietQR API
   - Tài khoản mới mở có thể chưa được cập nhật trong hệ thống

4. **API VietQR chưa được cấu hình**
   - Nếu chưa có API key VietQR, hệ thống sẽ không thể xác thực tự động

### Giải pháp

#### Giải pháp 1: Kiểm tra lại thông tin

1. **Kiểm tra số tài khoản:**
   - Đảm bảo số tài khoản đúng (thường là 8-19 chữ số)
   - Không có khoảng trắng hoặc ký tự đặc biệt
   - Ví dụ: `1234567890` (đúng) thay vì `123 456 7890` (sai)

2. **Kiểm tra tên ngân hàng:**
   - Chọn đúng tên ngân hàng từ danh sách
   - Đảm bảo mã ngân hàng (BIN) khớp với ngân hàng thực tế

3. **Kiểm tra tên chủ tài khoản:**
   - Nhập đúng tên chủ tài khoản như trên sổ sách ngân hàng
   - Tên phải khớp ít nhất 70% với tên từ ngân hàng

#### Giải pháp 2: Tạo tài khoản ở chế độ không nghiêm ngặt (Mặc định)

Theo mặc định, hệ thống cho phép tạo tài khoản ngay cả khi không tìm thấy qua API, nhưng sẽ đánh dấu là **chưa xác thực** (`isVerified = false`).

**Cách hoạt động:**
- Nếu API không tìm thấy tài khoản, hệ thống vẫn cho phép tạo
- Tài khoản sẽ được đánh dấu là `isVerified = false`
- Bạn vẫn có thể sử dụng tài khoản này để thanh toán
- Nhưng hệ thống sẽ cảnh báo rằng tài khoản chưa được xác thực

**Lưu ý:** Nếu bạn thấy lỗi này và không thể tạo tài khoản, có thể bạn đang ở **chế độ nghiêm ngặt** (strict mode).

#### Giải pháp 3: Tắt chế độ nghiêm ngặt (Nếu đang bật)

Nếu bạn đang gặp lỗi và không thể tạo tài khoản, có thể `STRICT_BANK_VERIFICATION` đang được set là `true`.

**Cách tắt:**

1. Mở file `.env` trong thư mục `backend`
2. Tìm dòng:
   ```env
   STRICT_BANK_VERIFICATION=true
   ```
3. Đổi thành:
   ```env
   STRICT_BANK_VERIFICATION=false
   ```
4. Hoặc xóa dòng này (mặc định là `false`)
5. Khởi động lại backend server

#### Giải pháp 4: Cấu hình API VietQR

Nếu chưa có API key VietQR, bạn có thể:

1. **Lấy API key VietQR:**
   - Xem hướng dẫn tại: `docs/HUONG_DAN_LAY_API_VIETQR.md`
   - Hoặc truy cập: https://www.vietqr.io/

2. **Thêm vào file `.env`:**
   ```env
   VIETQR_API_ID=your_api_id_here
   VIETQR_API_KEY=your_api_key_here
   ```

3. **Khởi động lại backend server**

#### Giải pháp 5: Sử dụng tài khoản khác

Nếu vẫn không được, bạn có thể:

1. Thử với tài khoản ngân hàng khác
2. Liên hệ ngân hàng để xác nhận thông tin tài khoản
3. Đảm bảo tài khoản đang hoạt động và không bị khóa

### Kiểm tra log

Nếu vẫn gặp vấn đề, kiểm tra log của backend để xem chi tiết lỗi:

```bash
# Xem log backend
cd backend
npm start
```

Tìm các dòng có chứa:
- `VietQR API error`
- `Bank account verification error`
- `Creating unverified bank account`

### Tóm tắt

- **Mặc định:** Hệ thống cho phép tạo tài khoản ngay cả khi không tìm thấy, nhưng đánh dấu là chưa xác thực
- **Strict mode:** Nếu `STRICT_BANK_VERIFICATION=true`, hệ thống sẽ từ chối tài khoản chưa được xác thực
- **Giải pháp:** Tắt strict mode hoặc cấu hình API VietQR để xác thực tự động

### Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề sau khi thử các giải pháp trên, vui lòng:
1. Kiểm tra log backend
2. Ghi lại thông báo lỗi chi tiết
3. Kiểm tra file `.env` có đúng cấu hình không



## Lỗi: "Không tìm thấy tài khoản với số tài khoản và mã ngân hàng này"

### Nguyên nhân

Lỗi này xảy ra khi VietQR API không tìm thấy thông tin tài khoản ngân hàng với số tài khoản và mã ngân hàng bạn cung cấp.

### Các nguyên nhân có thể:

1. **Số tài khoản không đúng**
   - Kiểm tra lại số tài khoản có đúng không
   - Đảm bảo không có khoảng trắng hoặc ký tự đặc biệt

2. **Mã ngân hàng không đúng**
   - Kiểm tra lại tên ngân hàng đã được chọn đúng chưa
   - Mã ngân hàng (BIN) phải khớp với ngân hàng thực tế

3. **Tài khoản không hỗ trợ tra cứu**
   - Một số loại tài khoản có thể không được hỗ trợ tra cứu qua VietQR API
   - Tài khoản mới mở có thể chưa được cập nhật trong hệ thống

4. **API VietQR chưa được cấu hình**
   - Nếu chưa có API key VietQR, hệ thống sẽ không thể xác thực tự động

### Giải pháp

#### Giải pháp 1: Kiểm tra lại thông tin

1. **Kiểm tra số tài khoản:**
   - Đảm bảo số tài khoản đúng (thường là 8-19 chữ số)
   - Không có khoảng trắng hoặc ký tự đặc biệt
   - Ví dụ: `1234567890` (đúng) thay vì `123 456 7890` (sai)

2. **Kiểm tra tên ngân hàng:**
   - Chọn đúng tên ngân hàng từ danh sách
   - Đảm bảo mã ngân hàng (BIN) khớp với ngân hàng thực tế

3. **Kiểm tra tên chủ tài khoản:**
   - Nhập đúng tên chủ tài khoản như trên sổ sách ngân hàng
   - Tên phải khớp ít nhất 70% với tên từ ngân hàng

#### Giải pháp 2: Tạo tài khoản ở chế độ không nghiêm ngặt (Mặc định)

Theo mặc định, hệ thống cho phép tạo tài khoản ngay cả khi không tìm thấy qua API, nhưng sẽ đánh dấu là **chưa xác thực** (`isVerified = false`).

**Cách hoạt động:**
- Nếu API không tìm thấy tài khoản, hệ thống vẫn cho phép tạo
- Tài khoản sẽ được đánh dấu là `isVerified = false`
- Bạn vẫn có thể sử dụng tài khoản này để thanh toán
- Nhưng hệ thống sẽ cảnh báo rằng tài khoản chưa được xác thực

**Lưu ý:** Nếu bạn thấy lỗi này và không thể tạo tài khoản, có thể bạn đang ở **chế độ nghiêm ngặt** (strict mode).

#### Giải pháp 3: Tắt chế độ nghiêm ngặt (Nếu đang bật)

Nếu bạn đang gặp lỗi và không thể tạo tài khoản, có thể `STRICT_BANK_VERIFICATION` đang được set là `true`.

**Cách tắt:**

1. Mở file `.env` trong thư mục `backend`
2. Tìm dòng:
   ```env
   STRICT_BANK_VERIFICATION=true
   ```
3. Đổi thành:
   ```env
   STRICT_BANK_VERIFICATION=false
   ```
4. Hoặc xóa dòng này (mặc định là `false`)
5. Khởi động lại backend server

#### Giải pháp 4: Cấu hình API VietQR

Nếu chưa có API key VietQR, bạn có thể:

1. **Lấy API key VietQR:**
   - Xem hướng dẫn tại: `docs/HUONG_DAN_LAY_API_VIETQR.md`
   - Hoặc truy cập: https://www.vietqr.io/

2. **Thêm vào file `.env`:**
   ```env
   VIETQR_API_ID=your_api_id_here
   VIETQR_API_KEY=your_api_key_here
   ```

3. **Khởi động lại backend server**

#### Giải pháp 5: Sử dụng tài khoản khác

Nếu vẫn không được, bạn có thể:

1. Thử với tài khoản ngân hàng khác
2. Liên hệ ngân hàng để xác nhận thông tin tài khoản
3. Đảm bảo tài khoản đang hoạt động và không bị khóa

### Kiểm tra log

Nếu vẫn gặp vấn đề, kiểm tra log của backend để xem chi tiết lỗi:

```bash
# Xem log backend
cd backend
npm start
```

Tìm các dòng có chứa:
- `VietQR API error`
- `Bank account verification error`
- `Creating unverified bank account`

### Tóm tắt

- **Mặc định:** Hệ thống cho phép tạo tài khoản ngay cả khi không tìm thấy, nhưng đánh dấu là chưa xác thực
- **Strict mode:** Nếu `STRICT_BANK_VERIFICATION=true`, hệ thống sẽ từ chối tài khoản chưa được xác thực
- **Giải pháp:** Tắt strict mode hoặc cấu hình API VietQR để xác thực tự động

### Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề sau khi thử các giải pháp trên, vui lòng:
1. Kiểm tra log backend
2. Ghi lại thông báo lỗi chi tiết
3. Kiểm tra file `.env` có đúng cấu hình không











