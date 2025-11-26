<div align="center">

# 🍽️ MenuOrder

**Hệ Thống Menu & Đặt Hàng Online Cho Các Quán Ăn**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-5.7+-blue.svg)](https://www.mysql.com/)

*Đề tài được thực hiện bởi: **Nguyễn Duy Quang – Lớp 11/9 – Trường THPT Nguyễn Trãi***

</div>

---

## 📋 Mục Lục

1. [CHƯƠNG 1: GIỚI THIỆU](#chương-1-giới-thiệu)
   - [1.1 Đặt vấn đề](#11-đặt-vấn-đề)
   - [1.2 Mục tiêu nghiên cứu](#12-mục-tiêu-nghiên-cứu)
   - [1.3 Phạm vi nghiên cứu](#13-phạm-vi-nghiên-cứu)
2. [CHƯƠNG 2: TỔNG QUAN NGHIÊN CỨU](#chương-2-tổng-quan-nghiên-cứu)
   - [2.1 Cơ sở lý thuyết và công nghệ sử dụng](#21-cơ-sở-lý-thuyết-và-công-nghệ-sử-dụng)
   - [2.2 Phân tích yêu cầu hệ thống](#22-phân-tích-yêu-cầu-hệ-thống)
   - [2.3 Thiết kế hệ thống](#23-thiết-kế-hệ-thống)
   - [2.4 Giải pháp và kỹ thuật](#24-giải-pháp-và-kỹ-thuật)
3. [CHƯƠNG 3: THỰC NGHIỆM VÀ KẾT QUẢ](#chương-3-thực-nghiệm-và-kết-quả)
   - [3.1 Quy trình thực hiện](#31-quy-trình-thực-hiện)
   - [3.2 Kết quả hiển thị](#32-kết-quả-hiển-thị)
   - [3.3 Thử nghiệm hệ thống](#33-thử-nghiệm-hệ-thống)
4. [CHƯƠNG 4: KẾT QUẢ NGHIÊN CỨU VÀ THẢO LUẬN](#chương-4-kết-quả-nghiên-cứu-và-thảo-luận)
   - [4.1 Kết quả đạt được](#41-kết-quả-đạt-được)
   - [4.2 So sánh hiệu quả](#42-so-sánh-hiệu-quả)
   - [4.3 Đánh giá sản phẩm](#43-đánh-giá-sản-phẩm)
5. [CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN](#chương-5-kết-luận-và-hướng-phát-triển)
   - [5.1 Kết luận](#51-kết-luận)
   - [5.2 Hướng phát triển trong tương lai](#52-hướng-phát-triển-trong-tương-lai)

---

## CHƯƠNG 1: GIỚI THIỆU

### 1.1 Đặt vấn đề

Trong thời đại chuyển đổi số, nhiều quán ăn vẫn vận hành theo cách truyền thống:

- ❌ **Ghi order bằng giấy** → Dễ nhầm lẫn, khó quản lý, dễ mất
- ❌ **Khách phải chờ** → Nhân viên ghi món mất thời gian
- ❌ **Không theo dõi doanh thu** → Không có hệ thống thống kê
- ❌ **Menu không minh bạch** → Chưa có menu online rõ ràng
- ❌ **Thiếu tính hiện đại** → Chưa áp dụng QR code, đặt hàng online

**MenuOrder** được xây dựng để giải quyết các vấn đề trên, tạo ra giải pháp quản lý menu online và đặt hàng trực tuyến hiện đại.

### 1.2 Mục tiêu nghiên cứu

#### Mục tiêu tổng quát
Xây dựng website cho phép khách hàng quét QR để xem menu và đặt món, đồng thời giúp chủ quán quản lý menu – đơn hàng – doanh thu dễ dàng.

#### Mục tiêu cụ thể
- ✅ Tạo tài khoản và quản lý cửa hàng
- ✅ Tạo danh mục món ăn, món ăn và tùy chọn món
- ✅ Tạo QR code riêng cho từng cửa hàng
- ✅ Hệ thống giỏ hàng và thanh toán
- ✅ Dashboard quản lý đơn hàng theo thời gian thực
- ✅ Thống kê doanh thu (tổng, tháng, năm)
- ✅ Cung cấp API đầy đủ, rõ ràng

### 1.3 Phạm vi nghiên cứu

- **Đối tượng:** Quán ăn nhỏ và vừa, khách hàng đặt món tại quán
- **Chức năng:** Quản lý menu, đặt hàng online, theo dõi đơn hàng, thống kê doanh thu
- **Công nghệ:** Web application (Next.js, Node.js, MySQL/PostgreSQL)
- **Triển khai:** Hệ thống có thể triển khai trên cloud (Render, Vercel)

---

## CHƯƠNG 2: TỔNG QUAN NGHIÊN CỨU

### 2.1 Cơ sở lý thuyết và công nghệ sử dụng

#### Công nghệ Backend
- **Node.js + Express.js:** Xây dựng RESTful API
- **MySQL/PostgreSQL:** Lưu trữ dữ liệu
- **Sequelize ORM:** Quản lý database
- **JWT + bcryptjs:** Bảo mật xác thực
- **Cloudinary:** Lưu trữ và tối ưu hình ảnh
- **QRCode generator:** Tạo QR code

#### Công nghệ Frontend
- **Next.js 14:** React framework với SSR
- **React 18:** UI library
- **Tailwind CSS:** Styling framework
- **Zustand:** State management
- **Axios:** HTTP client

#### Kiến thức liên môn
- **Tin học:** Lập trình web, database, bảo mật
- **Toán học:** Tính toán tổng tiền, tối ưu cấu trúc dữ liệu
- **Công nghệ:** Phân tích thiết kế hệ thống, UI/UX Design

### 2.2 Phân tích yêu cầu hệ thống

#### Yêu cầu chức năng

**Dành cho chủ quán:**

**Quản lý tài khoản và cửa hàng:**
- Đăng ký/đăng nhập với xác thực JWT
- Quản lý thông tin cửa hàng (tên, số điện thoại, địa chỉ, địa chỉ chi tiết, mô tả)
- Upload và quản lý logo cửa hàng
- Upload và quản lý hình ảnh cửa hàng
- Tạo slug URL riêng cho cửa hàng

**Quản lý menu:**
- CRUD danh mục món ăn (tạo, sửa, xóa, sắp xếp)
- CRUD món ăn với đầy đủ thông tin (tên, giá, mô tả, hình ảnh)
- Upload và crop hình ảnh món ăn qua Cloudinary
- Quản lý tùy chọn món (Item Options) - size, topping với giá riêng
- Quản lý món ăn kèm (Accompaniments) với giá riêng
- Xem menu theo danh mục

**Quản lý đơn hàng:**
- Dashboard với nhiều tab (Tổng quan, Đơn hàng, Menu, Cài đặt)
- Xem danh sách đơn hàng với bộ lọc và tìm kiếm
- Xem chi tiết đơn hàng (thông tin khách, món, ghi chú, thời gian)
- Thay đổi trạng thái đơn hàng (Chờ xác nhận, Đã xác nhận, Đang chuẩn bị, Sẵn sàng, Đã giao hàng, Hoàn tất, Đã hủy)
- Quản lý đơn hàng theo thời gian thực

**Thống kê và báo cáo:**
- Thống kê doanh thu tổng
- Thống kê doanh thu theo tháng
- Thống kê doanh thu theo năm
- Thống kê doanh thu theo ngày (click vào card để xem chi tiết)
- Xem danh sách đơn hàng theo ngày cụ thể

**QR Code:**
- Tự động tạo QR code cho cửa hàng
- Tải QR code về máy
- QR code liên kết trực tiếp đến menu cửa hàng

**Dành cho khách hàng:**

**Xem menu:**
- Quét QR code hoặc truy cập link để xem menu
- Xem menu với hình ảnh, mô tả, giá rõ ràng
- Xem menu theo danh mục
- Xem chi tiết món ăn

**Đặt hàng:**
- Chọn món ăn với số lượng
- Chọn tùy chọn món (size, topping) với giá tự động tính
- Chọn món ăn kèm (accompaniments) với giá tự động tính
- Thêm ghi chú cho từng món (ví dụ: không cay, ít đường)
- Thêm món vào giỏ hàng
- Xem và chỉnh sửa giỏ hàng
- Tự động tính tổng tiền

**Thanh toán:**
- Chọn loại đơn hàng (Tại quán / Giao hàng)
- Nhập thông tin khách hàng (tên, số điện thoại, email)
- Chọn số bàn (cho đơn tại quán)
- Nhập địa chỉ giao hàng (cho đơn giao hàng)
- Validate địa chỉ giao hàng tự động
- Tính phí ship tự động dựa trên khoảng cách
- Chọn phương thức thanh toán (Tiền mặt, Chuyển khoản, Thẻ tín dụng)
- Thêm ghi chú đơn hàng
- Đặt hàng không cần tài khoản

**Theo dõi đơn hàng:**
- Tìm kiếm đơn hàng bằng mã đơn hoặc số điện thoại
- Xem trạng thái đơn hàng theo thời gian thực
- Xem chi tiết đơn hàng (món, giá, ghi chú, thời gian)
- Xem lịch sử đơn hàng (nếu có nhiều đơn)
- Trang xác nhận đơn hàng thành công với mã đơn

#### Yêu cầu phi chức năng
- Giao diện thân thiện, tối ưu mobile
- Bảo mật dữ liệu (JWT, mã hóa mật khẩu)
- Hiệu suất tốt, phản hồi nhanh
- Dễ triển khai và bảo trì

### 2.3 Thiết kế hệ thống

#### Kiến trúc hệ thống
```
Frontend (Next.js) ←→ Backend API (Express.js) ←→ Database (MySQL/PostgreSQL)
                              ↓
                        Cloudinary (Images)
```

#### Cơ sở dữ liệu
```
users (1:1) stores
  ├── categories (1:N)
  │   └── items (1:N)
  │       ├── item_options (1:N)
  │       └── item_accompaniments (1:N)
  └── orders (1:N)
      └── order_items (1:N)
```

**Các bảng chính:**
- `users` - Thông tin người dùng (chủ quán)
- `stores` - Thông tin cửa hàng
- `categories` - Danh mục món ăn
- `items` - Món ăn
- `item_options` - Tùy chọn món (size, topping)
- `item_accompaniments` - Món ăn kèm
- `orders` - Đơn hàng
- `order_items` - Chi tiết đơn hàng

### 2.4 Giải pháp và kỹ thuật

#### Giải pháp kỹ thuật
1. **QR Code:** Mỗi cửa hàng có URL riêng, tự động tạo QR code
2. **Real-time Updates:** Dashboard cập nhật trạng thái đơn hàng theo thời gian thực
3. **Image Optimization:** Sử dụng Cloudinary để tối ưu hiệu suất
4. **Mobile-first Design:** Giao diện tối ưu cho thiết bị di động
5. **RESTful API:** API chuẩn, dễ mở rộng và bảo trì

#### Kỹ thuật xử lý
- **Authentication:** JWT token cho bảo mật
- **Password Hashing:** bcryptjs để mã hóa mật khẩu
- **State Management:** Zustand cho quản lý state frontend
- **Error Handling:** Xử lý lỗi toàn diện ở cả frontend và backend

---

## CHƯƠNG 3: THỰC NGHIỆM VÀ KẾT QUẢ

### 3.1 Quy trình thực hiện

1. **Khảo sát thực tế** tại quán ăn để hiểu nhu cầu
2. **Phân tích và thiết kế** hệ thống (UI/UX, sơ đồ database)
3. **Xây dựng backend:** API, database, bảo mật
4. **Xây dựng frontend:** giao diện mobile-first
5. **Kết nối frontend – backend** và kiểm thử
6. **Kiểm thử** trên máy tính, điện thoại, tablet
7. **Hoàn thiện** tài liệu và triển khai

### 3.2 Kết quả hiển thị

#### Giao diện chủ quán

**Dashboard:**
- Tab Tổng quan: Thống kê doanh thu (tổng, tháng, năm, hôm nay) với card có thể click để xem chi tiết
- Tab Đơn hàng: Danh sách đơn hàng với bộ lọc trạng thái, tìm kiếm, xem chi tiết
- Tab Menu: Quản lý danh mục và món ăn với CRUD đầy đủ
- Tab Cài đặt: Quản lý thông tin cửa hàng, upload logo và hình ảnh

**Quản lý menu:**
- Giao diện quản lý danh mục và món ăn trực quan
- Upload và crop hình ảnh trực tiếp trên web
- Quản lý tùy chọn món và món ăn kèm dễ dàng

**QR Code:**
- Hiển thị QR code và cho phép tải về

#### Giao diện khách hàng

**Trang menu:**
- Menu hiển thị đẹp với hình ảnh, mô tả, giá rõ ràng
- Chọn danh mục để xem món
- Xem chi tiết món với tùy chọn và món kèm
- Giao diện tối ưu cho mobile

**Trang giỏ hàng:**
- Hiển thị đầy đủ thông tin món, tùy chọn, món kèm, ghi chú
- Chỉnh sửa số lượng, xóa món
- Tự động tính tổng tiền

**Trang thanh toán:**
- Form đặt hàng với validation
- Chọn loại đơn (tại quán/giao hàng)
- Validate địa chỉ và tính phí ship tự động
- Chọn phương thức thanh toán

**Trang theo dõi đơn hàng:**
- Tìm kiếm đơn hàng bằng mã đơn hoặc số điện thoại
- Hiển thị trạng thái đơn hàng với màu sắc rõ ràng
- Xem chi tiết đơn hàng đầy đủ

### 3.3 Thử nghiệm hệ thống

#### Kết quả kiểm thử
- ✅ **Chức năng:** Tất cả tính năng hoạt động đúng
- ✅ **Hiệu suất:** Phản hồi nhanh, tải trang < 2 giây
- ✅ **Tương thích:** Hoạt động tốt trên Chrome, Firefox, Safari
- ✅ **Responsive:** Hiển thị tốt trên mobile, tablet, desktop
- ✅ **Bảo mật:** Xác thực và mã hóa hoạt động đúng

#### Đánh giá
- Hệ thống ổn định, có thể triển khai thực tế
- Giao diện thân thiện, dễ sử dụng
- Quy trình đặt hàng nhanh chóng (~10 giây)

---

## CHƯƠNG 4: KẾT QUẢ NGHIÊN CỨU VÀ THẢO LUẬN

### 4.1 Kết quả đạt được

**Hệ thống hoàn chỉnh:**
- ✅ **Hệ thống website menu online** với đầy đủ tính năng quản lý
- ✅ **Giao diện thân thiện**, dễ dùng, tối ưu di động (mobile-first)
- ✅ **Quét QR → xem menu → đặt món** trong ~10 giây
- ✅ **Tự động hóa quy trình** gọi món, giảm sai sót đáng kể
- ✅ **Quản lý đơn hàng hiệu quả** với 7 trạng thái rõ ràng
- ✅ **Thống kê doanh thu chi tiết** (tổng, tháng, năm, theo ngày)
- ✅ **Hỗ trợ cả đơn tại quán và giao hàng** với tính phí ship tự động
- ✅ **Upload và quản lý hình ảnh** qua Cloudinary với tính năng crop
- ✅ **Theo dõi đơn hàng** không cần tài khoản
- ✅ **Có thể triển khai thực tế** cho quán ăn nhỏ và vừa

### 4.2 So sánh hiệu quả

| Tiêu chí | Phương pháp truyền thống | MenuOrder |
|----------|-------------------------|-----------|
| **Ghi order** | Bằng giấy, dễ nhầm lẫn | Tự động, chính xác |
| **Thời gian đặt món** | 2-3 phút | ~10 giây |
| **Theo dõi doanh thu** | Thủ công, khó khăn | Tự động, chi tiết |
| **Quản lý menu** | Khó cập nhật | Dễ dàng, linh hoạt |
| **Trải nghiệm khách hàng** | Phải chờ, không rõ giá | Nhanh, minh bạch |

### 4.3 Đánh giá sản phẩm

#### Điểm mạnh

**Tính năng nổi bật:**
- 🌟 Mỗi cửa hàng có URL + QR riêng, dễ dàng truy cập
- 🌟 Menu online cập nhật theo thời gian thực, không cần refresh
- 🌟 Hệ thống giỏ hàng thông minh với tính năng tùy chọn món linh hoạt
- 🌟 Ghi chú cho từng món - tính năng độc đáo giúp đáp ứng nhu cầu khách hàng
- 🌟 Upload và crop hình ảnh trực tiếp trên web qua Cloudinary
- 🌟 Thống kê doanh thu chi tiết (tổng, tháng, năm, theo ngày)
- 🌟 Quản lý đơn hàng với 7 trạng thái rõ ràng
- 🌟 Hỗ trợ cả đơn tại quán và giao hàng
- 🌟 Validate địa chỉ và tính phí ship tự động
- 🌟 Theo dõi đơn hàng không cần tài khoản
- 🌟 Giao diện tối ưu cho thiết bị di động (mobile-first design)
- 🌟 Sử dụng công nghệ web hiện đại (Next.js 14, React 18, Zustand)

#### Ý nghĩa ứng dụng
- **Đối với chủ quán:** Giảm nhầm lẫn, tăng tính chuyên nghiệp, dễ theo dõi doanh thu
- **Đối với khách hàng:** Xem menu rõ ràng, đặt món nhanh, trải nghiệm hiện đại
- **Đối với cộng đồng:** Thúc đẩy chuyển đổi số, ứng dụng cao trong đời sống

---

## CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 5.1 Kết luận

Dự án **MenuOrder** đã xây dựng thành công hệ thống menu online và đặt hàng trực tuyến, giải quyết các vấn đề của quán ăn truyền thống. Hệ thống có thể triển khai thực tế, mang lại hiệu quả cao trong việc quản lý và phục vụ khách hàng.

**Đóng góp chính:**
- Tạo giải pháp hoàn chỉnh cho quán ăn nhỏ và vừa
- Ứng dụng công nghệ hiện đại (Next.js, Node.js)
- Thiết kế giao diện thân thiện, tối ưu mobile
- Hệ thống có thể mở rộng và bảo trì dễ dàng

### 5.2 Hướng phát triển trong tương lai

- [x] Upload ảnh món trực tiếp (Cloudinary integration)
- [x] Trạng thái đơn hàng "Hoàn tất"
- [x] Địa chỉ chi tiết tùy chỉnh
- [ ] Tích hợp thanh toán online (Momo, VNPay)
- [ ] Thông báo email / SMS
- [ ] Thống kê nâng cao bằng biểu đồ
- [ ] Hệ thống đánh giá – xếp hạng
- [ ] Tìm kiếm món bằng AI
- [ ] Hỗ trợ đa ngôn ngữ
- [ ] Ứng dụng mobile (React Native)

---

---

## 📚 Tài Liệu Tham Khảo

Để biết thêm chi tiết về cài đặt và sử dụng, vui lòng tham khảo:

- 🖼️ [Hướng Dẫn Setup Cloudinary](docs/CLOUDINARY_SETUP.md)
- 🔄 [Reset & Cập Nhật Database Trên Render](docs/RENDER_DATABASE_RESET.md)
- 🗄️ [Database Schema](database/schema.sql)
- 📖 [Database README](database/README.md)

---

## 📄 License

Mã nguồn mở – sử dụng cho mục đích **học tập và nghiên cứu**.

---

<div align="center">

## 👤 Thông Tin Tác Giả

**Nguyễn Duy Quang**  
*Lớp 11/9 – Trường THPT Nguyễn Trãi*

---

⭐ Nếu dự án này hữu ích, hãy cho một star!

Made with ❤️ by Nguyễn Duy Quang

</div>
