# BÁO CÁO TÓM TẮT

**CUỘC THI KHOA HỌC KĨ THUẬT CẤP TỈNH**
**DÀNH CHO HỌC SINH TRUNG HỌC PHỔ THÔNG**
**NĂM HỌC 2025 – 2026**

**SỞ GIÁO DỤC VÀ ĐÀO TẠO TP ĐÀ NẴNG**

**Hội An Tây, 12/2025**

---

## Tên đề tài

**NỀN TẢNG MENU & ĐẶT HÀNG ONLINE**
**CHO CÁC QUÁN CAFE, QUÁN ĂN**

---

## MỤC LỤC

1. [Vấn đề nghiên cứu](#1-vấn-đề-nghiên-cứu)

   * a. Vấn đề cần giải quyết hiện nay
   * b. Xác định các tiêu chí cho giải pháp giải quyết vấn đề
2. [Thiết kế và phương pháp](#2-thiết-kế-và-phương-pháp)

   * a. Quá trình nghiên cứu và lựa chọn giải pháp
   * b. Thiết kế mô hình/nguyên mẫu (Cơ sở lý thuyết và công nghệ)
3. [Thực hiện: chế tạo và kiểm tra](#3-thực-hiện-chế-tạo-và-kiểm-tra)

   * a. Quá trình chế tạo/thực hiện quy trình công nghệ
   * b. Kiểm tra và chứng minh sự khả thi, hiệu quả của giải pháp
   * c. Kết quả sản phẩm
4. [Kết luận và hướng phát triển](#4-kết-luận-và-hướng-phát-triển)

---

## BÁO CÁO

### 1. Vấn đề nghiên cứu

#### a. Vấn đề cần giải quyết hiện nay

Trong bối cảnh công nghệ số và chuyển đổi số diễn ra mạnh mẽ tại Việt Nam, tiến đến hạn chế tối đa việc sử dụng tiền mặt, nhu cầu nâng cao hiệu quả vận hành trong lĩnh vực dịch vụ ăn uống ngày càng trở nên cấp thiết.

Phần lớn các quán ăn nhỏ và vừa vẫn thực hiện quy trình order theo phương thức truyền thống như ghi món bằng giấy hoặc gọi nhân viên trực tiếp. Phương thức này gây ra nhiều hạn chế:

* Sai sót khi ghi order
* Truyền đạt chậm giữa nhân viên và bếp
* Thất lạc phiếu gọi món, khó kiểm soát doanh thu
* Thất thoát do order bị sửa, ghi thiếu hoặc khó đọc
* Chưa đáp ứng được kỳ vọng về tốc độ và sự chuyên nghiệp của khách hàng

Từ những bất cập trên, việc xây dựng đề tài **“Nền tảng Menu & Đặt hàng Online”** với chi phí thấp, dùng chung cho nhiều quán là hết sức cần thiết.

#### b. Xác định các tiêu chí cho giải pháp giải quyết vấn đề

Mục tiêu chính của dự án:

* Cung cấp menu điện tử thông qua mã QR
* Tự động hóa quy trình gọi món, giảm sai sót
* Đồng bộ order giữa khách hàng, nhân viên và bếp
* Quản lý món ăn, giá bán, trạng thái còn/hết theo thời gian thực
* Lưu trữ và thống kê doanh thu theo ngày/tuần/tháng
* Giảm chi phí vận hành và áp lực cho nhân viên

---

### 2. Thiết kế và phương pháp

#### a. Quá trình nghiên cứu và lựa chọn giải pháp

Qua khảo sát thực tế tại các quán ăn và quán café tại Đà Nẵng, Hội An, có thể thấy khoảng **80%** các quán vẫn sử dụng phương pháp order truyền thống.

Vào giờ cao điểm, nhân viên thường bị quá tải, khách hàng phải chờ đợi lâu, làm giảm trải nghiệm dịch vụ.

Giải pháp được lựa chọn là xây dựng **Nền tảng Menu & Đặt hàng Online** dựa trên các công nghệ web hiện đại, chi phí thấp, dễ triển khai và phù hợp với các quán nhỏ lẻ.

#### b. Thiết kế mô hình/nguyên mẫu (Cơ sở lý thuyết và công nghệ)

Hệ thống được thiết kế theo mô hình **Client – Server**.

| Thành phần | Công nghệ sử dụng                 | Chức năng                   |
| ---------- | --------------------------------- | --------------------------- |
| Backend    | Node.js, Express.js               | Xây dựng RESTful API        |
| Database   | MySQL / PostgreSQL, Sequelize ORM | Quản lý và lưu trữ dữ liệu  |
| Frontend   | Next.js 14, React 18              | Giao diện SSR, Mobile-first |
| Lưu trữ    | Cloudinary                        | Lưu trữ & tối ưu hình ảnh   |
| Styling    | Tailwind CSS                      | Thiết kế giao diện          |
| Bảo mật    | JWT, bcryptjs                     | Xác thực & mã hóa           |

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

### 3. Thực hiện: chế tạo và kiểm tra

#### a. Quá trình chế tạo/thực hiện quy trình công nghệ

Các giai đoạn chính:

* Khảo sát thực tế nhu cầu quán ăn
* Phân tích và thiết kế hệ thống (UI/UX, Database)
* Xây dựng backend và bảo mật
* Xây dựng frontend theo hướng mobile-first
* Kết nối hệ thống và kiểm thử

#### b. Kiểm tra và chứng minh sự khả thi, hiệu quả của giải pháp

Hệ thống được kiểm thử trên máy tính, điện thoại và tablet:

* **Chức năng:** Hoạt động đầy đủ, ổn định
* **Hiệu suất:** Thời gian tải trang dưới 2 giây
* **Responsive:** Hiển thị tốt trên nhiều thiết bị
* **Bảo mật:** Xác thực và mã hóa hoạt động chính xác

So sánh với phương pháp truyền thống:

* Thời gian gọi món: ~10 giây (QR) so với 2–3 phút
* Giảm sai sót nhờ tự động hóa
* Trải nghiệm minh bạch, nhanh chóng

**Sản phẩm hoàn thiện bao gồm:**

* Mỗi cửa hàng có link và QR riêng
* Menu online cập nhật thời gian thực
* Quản lý đơn hàng với 7 trạng thái
* Hỗ trợ đơn tại quán và giao hàng
* Tự động tính phí ship theo địa chỉ
* Thống kê doanh thu chi tiết
* Giao diện tối ưu cho điện thoại

#### c. Kết quả sản phẩm

* Giao diện quản lý quán
* Chủ quán xem chi tiết đơn hàng
* Giao diện order cho khách hàng
* Mã QR trải nghiệm (host miễn phí)

**Link đăng ký & trải nghiệm:**
👉 [https://menu-order-frontend.vercel.app](https://menu-order-frontend.vercel.app)

---

### 4. Kết luận và hướng phát triển

Dự án **Nền tảng Menu & Đặt hàng Online** đã hoàn thành thành công, mang lại giá trị thực tiễn cho các mô hình kinh doanh F&B truyền thống.

**Hướng phát triển tương lai:**

*  Sử dụng AI vào để tư vấn món ăn
* Tìm kiếm món ăn bằng AI
* Hỗ trợ đa ngôn ngữ
