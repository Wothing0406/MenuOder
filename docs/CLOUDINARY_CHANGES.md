# Tóm tắt thay đổi - Tích hợp Cloudinary

## Vấn đề đã giải quyết

✅ **Vấn đề**: Logo và ảnh quán bị mất sau 15-30 phút khi deploy trên Render (free tier)

✅ **Nguyên nhân**: Render free tier có filesystem ephemeral - files bị mất khi container restart/spin down

✅ **Giải pháp**: Tích hợp Cloudinary để lưu trữ ảnh trên cloud

## Files đã thay đổi

### 1. `backend/package.json`
- ✅ Thêm `cloudinary`: ^1.41.0
- ✅ Thêm `multer-storage-cloudinary`: ^4.0.0

### 2. `backend/src/utils/cloudinary.js` (MỚI)
- ✅ Service để upload/xóa ảnh trên Cloudinary
- ✅ Hỗ trợ upload từ buffer (không cần lưu file tạm)
- ✅ Tự động extract public_id từ URL để xóa
- ✅ Image optimization tự động (max 1200x1200px, auto quality)

### 3. `backend/src/middleware/upload.js`
- ✅ Tự động phát hiện Cloudinary đã được cấu hình chưa
- ✅ Nếu có Cloudinary: upload trực tiếp lên cloud
- ✅ Nếu không: fallback về local storage (cho development)
- ✅ Hỗ trợ cả logo, storeImage, và itemImage

### 4. `backend/src/controllers/storeController.js`
- ✅ Cập nhật `updateStore`: xóa ảnh cũ từ Cloudinary nếu cần
- ✅ Cập nhật `uploadLogo`: upload lên Cloudinary
- ✅ Cập nhật `uploadStoreImage`: upload lên Cloudinary
- ✅ Tất cả hàm `getLogoUrl` đã hỗ trợ Cloudinary URL
- ✅ Tự động xóa ảnh cũ khi upload ảnh mới

### 5. `backend/src/routes/storeRoutes.js`
- ✅ Upload middleware tự động chuyển đổi giữa Cloudinary và local storage
- ✅ Hỗ trợ upload buffer trực tiếp lên Cloudinary

## Cách hoạt động

### Khi Cloudinary được cấu hình:
1. Upload ảnh → Lưu vào memory buffer
2. Upload buffer lên Cloudinary
3. Lưu Cloudinary URL vào database
4. Trả về Cloudinary CDN URL cho frontend

### Khi Cloudinary chưa được cấu hình:
1. Upload ảnh → Lưu vào local filesystem (`uploads/`)
2. Lưu local path vào database
3. Trả về local URL (hoặc full URL trong production)

## Cấu hình cần thiết

Thêm 3 environment variables trên Render:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Xem chi tiết trong `docs/CLOUDINARY_SETUP.md`

## Lợi ích

✅ **Lưu trữ vĩnh viễn**: Ảnh không bị mất khi container restart
✅ **CDN tự động**: Cloudinary cung cấp CDN toàn cầu
✅ **Image optimization**: Tự động resize và optimize chất lượng
✅ **Free tier rộng rãi**: 25GB storage + 25GB bandwidth/tháng
✅ **Backward compatible**: Vẫn hoạt động với local storage nếu chưa cấu hình Cloudinary

## Testing

Sau khi deploy:
1. Kiểm tra logs: `📦 Using Cloudinary for file storage`
2. Upload logo/ảnh mới
3. Kiểm tra URL trả về: phải bắt đầu với `https://res.cloudinary.com/...`
4. Ảnh sẽ không bị mất khi container restart

## Migration

- Ảnh cũ (local) vẫn có thể bị mất
- Upload lại ảnh sau khi cấu hình Cloudinary
- Ảnh mới sẽ được lưu trên Cloudinary

## Next steps

1. Cài đặt dependencies: `cd backend && npm install`
2. Cấu hình Cloudinary (xem `CLOUDINARY_SETUP.md`)
3. Deploy lại backend trên Render
4. Upload lại logo/ảnh quán

