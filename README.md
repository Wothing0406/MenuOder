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

1. [Giới Thiệu Đề Tài](#-giới-thiệu-đề-tài)
2. [Sự Cần Thiết Của Đề Tài](#-sự-cần-thiết-của-đề-tài)
3. [Mục Tiêu Của Đề Tài](#-mục-tiêu-của-đề-tài)
4. [Kiến Thức Chuyên Môn](#-kiến-thức-liên-môn-được-áp-dụng)
5. [Tính Năng Chính](#-tính-năng-chính)
6. [Mô Hình Hệ Thống](#-mô-hình-hệ-thống)
7. [Quy Trình Thực Hiện](#-quy-trình-thực-hiện-đề-tài)
8. [Stack Công Nghệ](#-stack-công-nghệ)
9. [Kết Quả Đạt Được](#-kết-quả-đạt-được)
10. [Tính Mới – Sáng Tạo](#-tính-mới--sáng-tạo)
11. [Ý Nghĩa & Ứng Dụng](#-ý-nghĩa--ứng-dụng)
12. [Hướng Phát Triển Tương Lai](#-hướng-phát-triển-tương-lai)
13. [Cài Đặt & Sử Dụng](#-cài-đặt--sử-dụng)

---

## 🚀 Giới Thiệu Đề Tài

Trong thời đại chuyển đổi số mạnh mẽ, nhiều cửa hàng ăn uống vẫn vận hành theo cách truyền thống như **ghi order bằng tay**, không có hệ thống giỏ hàng và không theo dõi được doanh thu theo ngày. Điều này gây **sai sót**, **tốn thời gian** và **giảm trải nghiệm** của khách hàng.

**MenuOrder** được xây dựng nhằm tạo ra một **giải pháp quản lý menu online và đặt hàng trực tuyến hiện đại**, giúp các quán ăn vận hành hiệu quả và chuyên nghiệp hơn.

---

## 📌 Sự Cần Thiết Của Đề Tài

### ❌ Vấn Đề Hiện Tại

| Vấn Đề | Mô Tả |
|--------|-------|
| **Ghi order bằng giấy** | Dễ nhầm lẫn, khó quản lý, dễ mất |
| **Khách phải chờ** | Nhân viên ghi món → mất thời gian |
| **Không theo dõi doanh thu** | Không có hệ thống thống kê số lượng món bán |
| **Menu không minh bạch** | Chưa có menu online rõ ràng, trực quan |
| **Thiếu tính hiện đại** | Chưa áp dụng công nghệ QR code, đặt hàng online |

### ✅ Giải Pháp MenuOrder

👉 **Hệ thống Menu Order Online** giúp:
- ✅ Tối ưu quy trình phục vụ
- ✅ Giảm chi phí vận hành
- ✅ Nâng cao trải nghiệm khách hàng
- ✅ Tự động hóa quy trình đặt hàng
- ✅ Theo dõi doanh thu theo thời gian thực

---

## 🎯 Mục Tiêu Của Đề Tài

### **Mục Tiêu Tổng Quát**

Xây dựng **website** cho phép khách hàng **quét QR** để xem menu và đặt món, đồng thời giúp chủ quán **quản lý menu – đơn hàng – doanh thu** dễ dàng.

### **Mục Tiêu Cụ Thể**

- ✅ Tạo tài khoản và quản lý cửa hàng
- ✅ Tạo danh mục món ăn, món ăn và tùy chọn món
- ✅ Tạo QR code riêng cho từng cửa hàng
- ✅ Hệ thống giỏ hàng và thanh toán
- ✅ Dashboard quản lý đơn hàng theo thời gian thực
- ✅ Thống kê doanh thu (tổng, tháng, năm)
- ✅ Cung cấp API đầy đủ, rõ ràng

---

## 🎓 Kiến Thức Chuyên Môn Được Áp Dụng

### 🔹 Tin Học

- **Lập trình frontend:** HTML, CSS, JavaScript, React, Next.js
- **Lập trình backend:** Node.js, Express.js
- **Cơ sở dữ liệu:** SQL, Sequelize ORM
- **Bảo mật:** JWT, bcryptjs

### 🔹 Toán Học

- Tính tổng tiền, giảm giá
- Tối ưu cấu trúc dữ liệu
- Logic xử lý giỏ hàng

### 🔹 Công Nghệ

- Phân tích – thiết kế hệ thống
- UI/UX Design
- Quy trình phát triển phần mềm

### 🔹 Vật lý – Mạng (gián tiếp)

- Hiểu cơ chế hoạt động HTTP – request/response

---

## 🛠️ Tính Năng Chính

### 👨‍🍳 Dành Cho Chủ Quán

| Tính Năng | Mô Tả |
|-----------|-------|
| 🔐 **Đăng ký / Đăng nhập** | Xác thực bằng email – password, bảo mật với JWT |
| 🏪 **Quản lý cửa hàng** | Tạo và quản lý thông tin cửa hàng với slug URL riêng |
| 📂 **CRUD danh mục** | Tạo, sửa, xóa danh mục món ăn, sắp xếp theo thứ tự |
| 🍜 **CRUD món ăn** | Thêm, sửa, xóa món với hình ảnh, mô tả, giá cả |
| ⚙️ **Tùy chọn món** | Tạo options (size, topping, note) và món ăn kèm |
| 📝 **Ghi chú món** | Khách hàng có thể thêm ghi chú cho từng món |
| 📊 **Dashboard** | Xem tất cả đơn hàng, thay đổi trạng thái |
| 💰 **Theo dõi doanh thu** | Tổng doanh thu, doanh thu tháng, doanh thu năm |
| 📱 **Tạo QR code** | Tự động tạo và tải QR code cho cửa hàng |
| 🔍 **Chi tiết đơn hàng** | Xem đầy đủ: bàn, món, ghi chú, thời gian đặt |

### 🍜 Dành Cho Khách Hàng

| Tính Năng | Mô Tả |
|-----------|-------|
| 📱 **Quét QR / Truy cập link** | Quét QR hoặc truy cập link để xem menu |
| 🍽️ **Xem menu** | Menu có hình ảnh, mô tả, giá rõ ràng |
| 🛒 **Chọn món + tùy chọn** | Chọn món, size, topping, món kèm |
| 📝 **Ghi chú** | Thêm ghi chú cho từng món (không cay, ít đường...) |
| 🔢 **Số lượng** | Chọn số lượng cho mỗi món |
| 🪑 **Chọn số bàn** | Chọn số bàn khi đặt hàng |
| 💳 **Thêm vào giỏ hàng** | Tự động tính tổng tiền |
| 📋 **Đặt món** | Đặt hàng không cần tài khoản |
| ⏱️ **Theo dõi trạng thái** | Xem trạng thái đơn hàng theo thời gian thực |

---

## 🧠 Mô Hình Hệ Thống

### Cơ Sở Dữ Liệu

Hệ thống sử dụng **MySQL** với các bảng chính:

```
users
  └── stores (1:1)
      ├── categories (1:N)
      │   └── items (1:N)
      │       ├── item_options (1:N)
      │       └── item_accompaniments (1:N)
      └── orders (1:N)
          └── order_items (1:N)
```

### Các Bảng Chính

- **users** - Thông tin người dùng (chủ quán)
- **stores** - Thông tin cửa hàng
- **categories** - Danh mục món ăn
- **items** - Món ăn
- **item_options** - Tùy chọn món (size, topping)
- **item_accompaniments** - Món ăn kèm
- **orders** - Đơn hàng
- **order_items** - Chi tiết đơn hàng

---

## 🧪 Quy Trình Thực Hiện Đề Tài

1. **Khảo sát thực tế** tại quán ăn
2. **Phân tích và thiết kế hệ thống** (UI/UX, sơ đồ DB)
3. **Xây dựng backend:** API, database, bảo mật
4. **Xây dựng frontend:** giao diện mobile‑first
5. **Kết nối frontend – backend**
6. **Kiểm thử** trên máy tính, điện thoại, tablet
7. **Hoàn thiện** tài liệu – báo cáo – thuyết trình

---

## 💻 Stack Công Nghệ

### **Backend**

| Công Nghệ | Mục Đích |
|-----------|----------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MySQL** | Database |
| **Sequelize ORM** | Object-Relational Mapping |
| **JWT Authentication** | Xác thực người dùng |
| **bcryptjs** | Mã hóa mật khẩu |
| **QRCode generator** | Tạo QR code |

### **Frontend**

| Công Nghệ | Mục Đích |
|-----------|----------|
| **Next.js 14** | React framework với SSR |
| **React 18** | UI library |
| **Tailwind CSS** | Styling framework |
| **Zustand** | State management |
| **Axios** | HTTP client |
| **react-hot-toast** | Notifications |

---

## 📊 Kết Quả Đạt Được

- ✅ **Hệ thống website menu online hoàn chỉnh**
- ✅ **Giao diện thân thiện**, dễ dùng, tối ưu di động
- ✅ **Quét QR → xem menu → đặt món** trong ~10 giây
- ✅ **Tự động hóa quy trình** gọi món, giảm sai sót
- ✅ **Chủ quán theo dõi đơn hàng** hiệu quả hơn 80%
- ✅ **Có thể triển khai thực tế** cho quán ăn nhỏ và vừa

---

## ✨ Tính Mới – Sáng Tạo

- 🌟 **Mỗi cửa hàng có URL + QR riêng**
- 🌟 **Menu online cập nhật theo thời gian thực**
- 🌟 **Sử dụng công nghệ web hiện đại** (Next.js 14, Zustand)
- 🌟 **Hệ thống giỏ hàng + tùy chọn món linh hoạt**
- 🌟 **Giao diện tối ưu cho thiết bị di động**
- 🌟 **Thống kê doanh thu chi tiết** (tổng, tháng, năm)
- 🌟 **Ghi chú cho từng món** - tính năng độc đáo

---

## 📈 Ý Nghĩa & Ứng Dụng

### **Đối Với Chủ Quán**

- ✅ Giảm nhầm lẫn khi ghi order
- ✅ Tăng tính chuyên nghiệp
- ✅ Dễ dàng theo dõi doanh thu
- ✅ Quản lý menu linh hoạt
- ✅ Tiết kiệm thời gian và chi phí

### **Đối Với Khách Hàng**

- ✅ Xem menu rõ ràng, trực quan
- ✅ Đặt món nhanh chóng, không cần chờ
- ✅ Trải nghiệm hiện đại, tiện lợi
- ✅ Có thể thêm ghi chú theo yêu cầu

### **Đối Với Cộng Đồng**

- ✅ Thúc đẩy chuyển đổi số tại địa phương
- ✅ Ứng dụng cao trong đời sống
- ✅ Phù hợp với xu hướng công nghệ hiện đại

---

## 🚀 Hướng Phát Triển Tương Lai

- [ ] Upload ảnh món trực tiếp
- [ ] Tích hợp thanh toán online (Momo, VNPay)
- [ ] Thông báo email / SMS
- [ ] Thống kê nâng cao bằng biểu đồ
- [ ] Hệ thống đánh giá – xếp hạng
- [ ] Tìm kiếm món bằng AI
- [ ] Hỗ trợ đa ngôn ngữ
- [ ] Ứng dụng mobile (React Native)

---

## ⚙️ Cài Đặt & Sử Dụng

### 📋 Yêu Cầu Hệ Thống

- **Node.js** 14+ 
- **npm** hoặc **yarn**
- **MySQL** 5.7+
- **Git** (Optional)

### 🚀 Cài Đặt Nhanh

#### 1. Clone Repository

```bash
git clone <repository-url>
cd online-menu-order
```

#### 2. Cài Đặt Backend

```bash
cd backend
npm install

# Tạo file .env
cp .env.example .env
# Hoặc tạo file .env với nội dung:
```

**File `.env` mẫu:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=menu_order_db
DB_USER=root
DB_PASSWORD=your_password

PORT=5000
NODE_ENV=development

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=24h

FRONTEND_URL=http://localhost:3000
UPLOAD_PATH=./uploads
```

#### 3. Setup Database

**Cách 1: Sử dụng Script (Khuyến nghị)**
```bash
cd backend
npm run reset-db
```

**Cách 2: Sử dụng MySQL trực tiếp**
```bash
mysql -u root -p < database/reset.sql
mysql -u root -p < database/seed.sql
```

#### 4. Cài Đặt Frontend

```bash
cd frontend
npm install

# Tạo file .env.local
```

**File `.env.local` mẫu:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 5. Chạy Ứng Dụng

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend: `http://localhost:3000`

### 🎉 Thông Tin Đăng Nhập Mẫu

Sau khi chạy seed data:
- **Email:** `admin@restaurant.com`
- **Password:** `password123`
- **Store URL:** `http://localhost:3000/store/nha-hang-mau`

### 📚 Tài Liệu Tham Khảo

- 📖 [Hướng Dẫn Cài Đặt Chi Tiết](docs/SETUP.md)
- 🔄 [Reset Database](RESET_DATABASE.md)
- 🔌 [API Documentation](docs/API_DOCUMENTATION.md)
- 🗄️ [Database Schema](database/schema.sql)

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
# MenuOder
