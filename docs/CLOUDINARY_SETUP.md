# Hướng dẫn cấu hình Cloudinary để lưu trữ ảnh

## Vấn đề

Khi deploy backend trên Render (free tier), filesystem là ephemeral - nghĩa là khi container restart hoặc spin down sau 15-30 phút không có request, tất cả files sẽ bị mất. Điều này khiến logo và ảnh của quán bị mất sau một khoảng thời gian.

## Giải pháp

Sử dụng Cloudinary để lưu trữ ảnh trên cloud. Cloudinary cung cấp:
- Free tier rộng rãi (25GB storage, 25GB bandwidth/tháng)
- CDN tự động
- Image optimization tự động
- Lưu trữ vĩnh viễn

## Các bước cấu hình

### 1. Tạo tài khoản Cloudinary

1. Truy cập https://cloudinary.com/users/register/free
2. Đăng ký tài khoản miễn phí
3. Xác nhận email

### 2. Lấy thông tin API

Sau khi đăng nhập, vào Dashboard, bạn sẽ thấy:
- **Cloud Name**: Tên cloud của bạn
- **API Key**: Key để upload
- **API Secret**: Secret key (giữ bí mật)

### 3. Cấu hình Environment Variables trên Render

1. Vào Render Dashboard
2. Chọn Web Service của backend
3. Vào tab **Environment**
4. Thêm các biến môi trường sau:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Lưu ý**: Thay `your_cloud_name`, `your_api_key`, `your_api_secret` bằng giá trị thực tế từ Cloudinary Dashboard.

### 4. Cài đặt dependencies

Dependencies đã được thêm vào `package.json`:
- `cloudinary`: SDK chính thức của Cloudinary
- `multer-storage-cloudinary`: Storage adapter cho multer

Chạy lệnh sau để cài đặt:

```bash
cd backend
npm install
```

### 5. Deploy lại backend

Sau khi cấu hình environment variables, deploy lại backend trên Render:

1. Vào Render Dashboard
2. Chọn Web Service của backend
3. Click **Manual Deploy** > **Deploy latest commit**

Hoặc push code mới lên repository để trigger auto-deploy.

## Cách hoạt động

### Khi Cloudinary được cấu hình

- Ảnh được upload trực tiếp lên Cloudinary (không lưu vào filesystem)
- URL trả về là Cloudinary CDN URL (ví dụ: `https://res.cloudinary.com/xxx/image/upload/...`)
- Ảnh được lưu trữ vĩnh viễn trên cloud
- Khi xóa, ảnh cũng được xóa khỏi Cloudinary

### Khi Cloudinary chưa được cấu hình

- Hệ thống tự động fallback về local storage
- Ảnh được lưu vào thư mục `uploads/`
- Hoạt động như trước đây (chỉ phù hợp cho development)

## Kiểm tra

Sau khi deploy, kiểm tra logs của backend trên Render:

1. Nếu thấy: `📦 Using Cloudinary for file storage` → Cloudinary đã được cấu hình thành công
2. Nếu thấy: `💾 Using local file storage` → Cloudinary chưa được cấu hình, đang dùng local storage

## Upload ảnh mới

Sau khi cấu hình Cloudinary:
1. Upload logo hoặc ảnh quán mới
2. URL trả về sẽ là Cloudinary URL (bắt đầu với `https://res.cloudinary.com/...`)
3. Ảnh sẽ không bị mất khi container restart

## Migration ảnh cũ

Nếu bạn đã có ảnh cũ được lưu local:
1. Download ảnh từ Render (nếu còn)
2. Upload lại ảnh qua API hoặc giao diện admin
3. Ảnh mới sẽ được lưu trên Cloudinary

## Troubleshooting

### Lỗi: "Cloudinary chưa được cấu hình"

**Nguyên nhân**: Thiếu hoặc sai environment variables

**Giải pháp**:
1. Kiểm tra lại các biến môi trường trên Render
2. Đảm bảo tên biến đúng: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
3. Deploy lại backend

### Ảnh vẫn bị mất

**Nguyên nhân**: Có thể backend chưa được deploy lại sau khi cấu hình

**Giải pháp**:
1. Kiểm tra logs để xác nhận Cloudinary đã được sử dụng
2. Upload lại ảnh sau khi đã cấu hình Cloudinary
3. Ảnh cũ (local) vẫn có thể bị mất, nhưng ảnh mới sẽ được lưu trên Cloudinary

### Upload thất bại

**Nguyên nhân**: Có thể do:
- API key/secret sai
- Cloud name sai
- File quá lớn (>5MB)
- Format không được hỗ trợ

**Giải pháp**:
1. Kiểm tra lại thông tin API trên Cloudinary Dashboard
2. Kiểm tra format file (chỉ hỗ trợ: jpg, jpeg, png, webp, gif)
3. Kiểm tra kích thước file (giới hạn 5MB)

## Tối ưu hóa

Cloudinary tự động:
- Resize ảnh về tối đa 1200x1200px
- Optimize chất lượng ảnh (auto quality)
- Serve qua CDN toàn cầu

Bạn có thể tùy chỉnh thêm trong file `backend/src/utils/cloudinary.js` nếu cần.

## Chi phí

**Free tier** của Cloudinary bao gồm:
- 25GB storage
- 25GB bandwidth/tháng
- Unlimited transformations
- CDN included

Đối với hầu hết các ứng dụng nhỏ và vừa, free tier là đủ. Nếu vượt quá, bạn có thể nâng cấp lên paid plan.

## Tài liệu tham khảo

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Multer Cloudinary Storage](https://github.com/affanshahid/multer-storage-cloudinary)

