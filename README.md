<div align="center">

# BÁO CÁO TÓM TẮT

**CUỘC THI KHOA HỌC KĨ THUẬT CẤP TỈNH – NĂM HỌC 2025 – 2026**  
**NỀN TẢNG MENU & ĐẶT HÀNG ONLINE CHO CÁC QUÁN CAFE, QUÁN ĂN**  
**SỞ GIÁO DỤC VÀ ĐÀO TẠO TP ĐÀ NẴNG** · **Hội An Tây, 12/2025**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-5.7+-blue.svg)](https://www.mysql.com/)

*Thực hiện: **Nguyễn Duy Quang – Lớp 11/9 – Trường THPT Nguyễn Trãi***

</div>

---

## Tên đề tài
**NỀN TẢNG MENU & ĐẶT HÀNG ONLINE CHO CÁC QUÁN CAFE, QUÁN ĂN**

**Link đăng ký & trải nghiệm:** https://menu-order-frontend.vercel.app  
**Báo cáo chi tiết:** xem `baocao.md`

---

## Mục lục
1. [Vấn đề nghiên cứu](#1-vấn-đề-nghiên-cứu)  
   a. Vấn đề cần giải quyết hiện nay  
   b. Tiêu chí/ mục tiêu giải pháp
2. [Thiết kế và phương pháp](#2-thiết-kế-và-phương-pháp)  
   a. Quá trình nghiên cứu và lựa chọn giải pháp  
   b. Thiết kế mô hình & công nghệ
3. [Thực hiện: chế tạo và kiểm tra](#3-thực-hiện-chế-tạo-và-kiểm-tra)  
   a. Quy trình chế tạo / triển khai  
   b. Kiểm tra & chứng minh tính khả thi  
   c. Kết quả sản phẩm (tính năng)
4. [Kết luận và hướng phát triển](#4-kết-luận-và-hướng-phát-triển)
5. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

---

## 1. Vấn đề nghiên cứu

### a. Vấn đề cần giải quyết hiện nay
- Quy trình order giấy dễ sai sót, thất lạc, khó kiểm soát doanh thu.  
- Truyền đạt chậm giữa nhân viên – bếp; khách phải chờ lâu.  
- Không theo dõi được tồn còn/hết món theo thời gian thực.  
- Thiếu minh bạch giá, thiếu thống kê doanh thu.

### b. Tiêu chí/ mục tiêu giải pháp
- Cung cấp menu điện tử qua QR, thao tác nhanh ~10 giây.  
- Tự động hóa order, đồng bộ khách – nhân viên – bếp.  
- Quản lý món, giá, trạng thái còn/hết thời gian thực.  
- Thống kê doanh thu theo ngày/tháng/năm, xem chi tiết theo ngày.  
- Chi phí thấp, dễ triển khai cho quán nhỏ & vừa.

---

## 2. Thiết kế và phương pháp

### a. Quá trình nghiên cứu & lựa chọn giải pháp
Khảo sát thực tế cho thấy ~80% quán vẫn order truyền thống, quá tải giờ cao điểm. Giải pháp: xây dựng nền tảng web chi phí thấp, triển khai nhanh, tối ưu di động.

### b. Thiết kế mô hình & công nghệ

| Thành phần | Công nghệ | Chức năng |
| --- | --- | --- |
| Backend | Node.js, Express.js | RESTful API |
| Database | MySQL/PostgreSQL, Sequelize ORM | Lưu trữ & quản lý dữ liệu |
| Frontend | Next.js 14, React 18 | Giao diện SSR, mobile-first |
| Lưu trữ ảnh | Cloudinary | Tối ưu & lưu trữ hình ảnh |
| Bảo mật | JWT, bcryptjs | Xác thực & mã hóa |

**Mô hình cơ sở dữ liệu:**
```
users (1:1) stores
 ├── categories (1:N)
 │   └── items (1:N)
 │       ├── item_options (1:N)
 │       └── item_accompaniments (1:N)
 └── orders (1:N)
     └── order_items (1:N)
```

---

## 3. Thực hiện: chế tạo và kiểm tra

### a. Quy trình chế tạo / triển khai
1) Khảo sát nhu cầu quán ăn.  
2) Phân tích & thiết kế (UI/UX, DB).  
3) Xây dựng backend & bảo mật.  
4) Xây dựng frontend mobile-first.  
5) Kết nối hệ thống & kiểm thử đa thiết bị.  
6) Hoàn thiện tài liệu, triển khai demo.

### b. Kiểm tra & chứng minh tính khả thi
- Chức năng: đầy đủ, ổn định.  
- Hiệu suất: tải trang < 2 giây.  
- Responsive: tốt trên PC, tablet, mobile.  
- Bảo mật: JWT, mã hóa mật khẩu hoạt động đúng.

### c. Kết quả sản phẩm (tính năng mới & nổi bật)
- Mỗi cửa hàng có link & QR riêng (host sẵn để trải nghiệm).  
- Menu online cập nhật thời gian thực, quản lý còn/hết món.  
- Đơn tại quán & giao hàng; tự động tính phí ship theo địa chỉ (OpenStreetMap miễn phí), giới hạn phạm vi 15km, API validate địa chỉ cảnh báo thiếu số nhà/địa chỉ lệch.  
- Thanh toán đa kênh: tiền mặt, chuyển khoản/VietQR, ZaloPay QR, thẻ; tự suy luận phương thức khi chọn tài khoản. Quản lý nhiều tài khoản thanh toán (ngân hàng/ZaloPay), đặt mặc định, bật/tắt, trạng thái xác minh.  
- Voucher/khuyến mãi: phần trăm hoặc số tiền, tối thiểu đơn, trần giảm, giới hạn lượt, thời gian bắt đầu/kết thúc/không hết hạn; áp dụng theo cửa hàng hoặc voucher chung; tự bỏ qua nếu không hợp lệ.  
- 7 trạng thái đơn hàng; auto đánh dấu đã thanh toán khi chủ quán Confirm/Complete; tra cứu đơn bằng mã hoặc số điện thoại.  
- Thống kê doanh thu tổng/tháng/năm/ngày + biểu đồ; breakdown theo phương thức (tiền mặt/chuyển khoản/ZaloPay/khác); so sánh doanh thu non-cash.  
- Báo cáo vận hành: top món bán chạy (tuần/tháng/năm/toàn thời gian); tỷ lệ đơn/doanh thu dine-in vs delivery.  
- Upload & crop ảnh món và logo qua Cloudinary.  
- Ghi chú cho từng món; tùy chọn size/topping, món kèm với giá riêng.  
- Giao diện mobile-first, tối ưu cho thiết bị di động.

---

## 4. Kết luận và hướng phát triển

### Kết luận
Nền tảng đáp ứng mục tiêu: quét QR → xem menu → đặt món nhanh (~10 giây), giảm sai sót, minh bạch giá, quản lý đơn & doanh thu thời gian thực, sẵn sàng triển khai cho quán nhỏ và vừa.

### Hướng phát triển
- Tư vấn món theo nhu cầu và sức khoẻ
- Thông báo email/SMS.  
- Thống kê nâng cao bằng biểu đồ.  
- Hệ thống đánh giá – xếp hạng.  
- Tìm kiếm/đề xuất món bằng AI, hỗ trợ đa ngôn ngữ.  
- Ứng dụng mobile (React Native).

---

## Tài liệu tham khảo

