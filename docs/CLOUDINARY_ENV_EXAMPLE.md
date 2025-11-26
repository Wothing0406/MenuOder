# Ví dụ cấu hình Environment Variables cho Cloudinary

## Trên Render Dashboard

Vào **Environment** tab của Web Service backend và thêm:

```
CLOUDINARY_CLOUD_NAME=dxxxxx
CLOUDINARY_API_KEY=621653751536555
CLOUDINARY_API_SECRET=jiikEQGiJ0u... (full secret - không bị cắt)
```

## Lưu ý quan trọng:

1. **Cloud Name**: Thường bắt đầu bằng `d` (ví dụ: `dxxxxx`) hoặc tên bạn đặt khi tạo account
2. **API Key**: Số bạn thấy trong dashboard (ví dụ: `621653751536555`)
3. **API Secret**: Phải lấy FULL secret (click "Reveal" để xem toàn bộ, không dùng dấu `...`)

## Kiểm tra sau khi cấu hình:

1. Deploy lại backend trên Render
2. Kiểm tra logs, bạn sẽ thấy: `📦 Using Cloudinary for file storage`
3. Nếu thấy: `💾 Using local file storage` → Kiểm tra lại environment variables

## Bảo mật:

- ⚠️ **KHÔNG** commit API Secret vào Git
- ⚠️ **KHÔNG** chia sẻ API Secret công khai
- ✅ Chỉ thêm vào Environment Variables trên Render
- ✅ API Secret chỉ hiển thị một lần, hãy copy ngay

