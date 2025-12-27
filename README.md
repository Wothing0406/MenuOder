<div align="center">

# 🍽️ MenuOrder

**Hệ Thống Menu & Đặt Hàng Online Cho Các Quán Ăn**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)](https://www.mysql.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-red.svg)](https://www.postgresql.org/)

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
     - [2.3.1 Kiến trúc hệ thống](#231-kiến-trúc-hệ-thống)
     - [2.3.2 Sơ đồ cơ sở dữ liệu](#232-sơ-đồ-cơ-sở-dữ-liệu)
     - [2.3.3 Sơ đồ luồng người dùng](#233-sơ-đồ-luồng-người-dùng)
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
6. [PHỤ LỤC](#phụ-lục)
   - [A. API Documentation](#a-api-documentation)
   - [B. Cấu trúc Frontend](#b-cấu-trúc-frontend)
   - [C. Hướng dẫn triển khai](#c-hướng-dẫn-triển-khai)

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
- **Node.js 18+ + Express.js 4.18:** Xây dựng RESTful API với middleware routing
- **MySQL 8.0+ / PostgreSQL 15+:** Hỗ trợ cả hai hệ quản trị CSDL
- **Sequelize 6.35:** ORM với migrations, associations, và query optimization
- **JWT + bcryptjs:** Authentication với token-based security
- **Cloudinary:** Image upload, optimization và CDN delivery
- **QRCode generator:** Tạo QR code động cho từng cửa hàng
- **Multer:** File upload handling
- **Express-validator:** Input validation và sanitization
- **CORS:** Cross-origin resource sharing

#### Công nghệ Frontend
- **Next.js 14:** React framework với App Router, SSR/SSG, API routes
- **React 18:** Concurrent features, automatic batching
- **Tailwind CSS 3.4:** Utility-first CSS với responsive design
- **Zustand 4.4:** Lightweight state management (thay thế Redux)
- **Axios 1.5:** HTTP client với interceptors cho auth
- **React Easy Crop:** Image cropping cho upload ảnh
- **React Hot Toast:** Toast notifications
- **Recharts:** Data visualization cho dashboard
- **Lottie React:** Animations và loading states

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

#### 2.3.1 Kiến trúc hệ thống

**Kiến trúc tổng thể:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile/Web    │    │   Next.js       │    │   Express.js    │
│   Client        │◄──►│   Frontend      │◄──►│   Backend API   │
│                 │    │   (React 18)    │    │   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                                                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MySQL/Postgre │    │   Cloudinary     │    │   QR Code       │
│   Database      │    │   Images         │    │   Generator     │
│   (Sequelize)   │    │   Storage        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Cấu trúc Backend:**
```
backend/
├── src/
│   ├── config/          # Database & Cloudinary config
│   ├── controllers/     # Business logic (13 controllers)
│   ├── middleware/      # Auth, validation, CORS
│   ├── models/          # Sequelize models (12 models)
│   ├── routes/          # API routes (15 route files)
│   └── utils/           # Helper functions
├── scripts/             # Migration & maintenance scripts
└── uploads/             # Local file storage
```

**Cấu trúc Frontend:**
```
frontend/
├── pages/               # Next.js pages & API routes
│   ├── admin/          # Admin dashboard pages
│   ├── dashboard/      # Store owner dashboard
│   ├── store/[slug]    # Public store menu
│   └── [other pages]
├── components/          # Reusable React components
├── lib/                # Utilities & configurations
├── public/             # Static assets
└── styles/             # Global styles
```

#### 2.3.2 Sơ đồ cơ sở dữ liệu

**Quan hệ thực thể:**

```
┌─────────────────────────────────────────────────────────────────┐
│                            USERS                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ id (PK)              email (UQ)     password           │   │
│  │ storeName            storePhone      storeAddress      │   │
│  │ role (store_owner)   createdAt       updatedAt         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                 │                              │
│                                 │ 1:1                          │
│                                 ▼                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                         STORES                          │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ id (PK)        userId (FK)     storeName        │    │   │
│  │  │ storeSlug (UQ) storePhone      storeAddress     │    │   │
│  │  │ storeDesc      storeLogo       storeImage       │    │   │
│  │  │ isActive       createdAt       updatedAt        │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                                                         │   │
│  │  ┌─────────────┬─────────────┬─────────────┐           │   │
│  │  │ CATEGORIES  │   ITEMS     │   ORDERS    │           │   │
│  │  │ (1:N)       │   (1:N)     │   (1:N)     │           │   │
│  │  └─────────────┴─────────────┴─────────────┘           │   │
│  │           │               │                   │         │   │
│  │           │ 1:N            │ 1:N              │ 1:N     │   │
│  │           ▼               ▼                   ▼         │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │   │
│  │  │   ITEMS     │ │ ORDER_ITEMS │ │  VOUCHERS  │       │   │
│  │  │             │ │ (1:N)       │ │  (1:N)     │       │   │
│  │  └─────────────┴─┴─────────────┴─┴─────────────┘       │   │
│  │           │               │                   │         │   │
│  │           │ 1:N            │ 1:N              │ 1:N     │   │
│  │           ▼               ▼                   ▼         │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │   │
│  │  │ITEM_OPTIONS │ │   REVIEWS   │ │PAYMENT_ACCT│       │   │
│  │  │  (1:N)      │ │   (1:N)     │ │   (1:N)    │       │   │
│  │  └─────────────┴─┴─────────────┴─┴─────────────┘       │   │
│  │           │                                           │   │
│  │           ▼                                           │   │
│  │  ┌─────────────┐                                     │   │
│  │  │ITEM_ACCOMPA-│                                     │   │
│  │  │ NIMENTS     │                                     │   │
│  │  │  (1:N)      │                                     │   │
│  │  └─────────────┘                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Chi tiết các bảng chính:**

| Bảng | Mô tả | Khóa chính | Khóa ngoại |
|------|-------|------------|------------|
| `users` | Thông tin chủ quán | `id` | - |
| `stores` | Thông tin cửa hàng | `id` | `userId` → `users.id` |
| `categories` | Danh mục món ăn | `id` | `storeId` → `stores.id` |
| `items` | Món ăn | `id` | `categoryId`, `storeId` |
| `item_options` | Tùy chọn món (size, topping) | `id` | `itemId` → `items.id` |
| `item_accompaniments` | Món ăn kèm | `id` | `itemId` → `items.id` |
| `orders` | Đơn hàng | `id` | `storeId`, `voucherId` |
| `order_items` | Chi tiết đơn hàng | `id` | `orderId`, `itemId` |
| `vouchers` | Mã giảm giá | `id` | `storeId` |
| `reviews` | Đánh giá | `id` | `storeId`, `itemId`, `orderId` |
| `payment_accounts` | Tài khoản thanh toán | `id` | `storeId` |

#### 2.3.3 Sơ đồ luồng người dùng

**Luồng khách hàng:**
```
1. Khách hàng quét QR code
   ↓
2. Xem menu cửa hàng (/store/[slug])
   ↓
3. Chọn món ăn → Thêm vào giỏ hàng
   ↓
4. Xem giỏ hàng → Điều chỉnh số lượng/tùy chọn
   ↓
5. Thanh toán (/checkout)
   ↓
6. Nhập thông tin giao hàng
   ↓
7. Chọn phương thức thanh toán
   ↓
8. Đặt hàng thành công → Trang xác nhận
   ↓
9. Theo dõi đơn hàng (/track-order)
```

**Luồng chủ quán:**
```
1. Đăng ký tài khoản (/register)
   ↓
2. Đăng nhập (/login)
   ↓
3. Thiết lập thông tin cửa hàng (Dashboard → Settings)
   ↓
4. Quản lý menu (Dashboard → Menu)
   │   ├── Thêm/sửa/xóa danh mục
   │   ├── Thêm/sửa/xóa món ăn
   │   └── Cấu hình tùy chọn món
   ↓
5. Quản lý đơn hàng (Dashboard → Orders)
   │   ├── Xem danh sách đơn hàng
   │   ├── Cập nhật trạng thái
   │   └── Xem chi tiết đơn hàng
   ↓
6. Xem thống kê (Dashboard → Analytics)
   ↓
7. Tải QR code về in
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

**1. QR Code System:**
- URL động: `/store/[storeSlug]` cho mỗi cửa hàng
- QR code SVG/PNG với logo tích hợp
- Download QR code để in ấn

**2. Real-time Dashboard:**
- Polling mechanism cho cập nhật trạng thái đơn hàng
- WebSocket ready architecture (dễ mở rộng)
- Live notifications cho đơn hàng mới

**3. Image Management:**
- Cloudinary integration với transformations
- Auto-resize, format conversion (WebP)
- Lazy loading và progressive images
- Local fallback khi Cloudinary unavailable

**4. Mobile-first Responsive Design:**
- Tailwind CSS breakpoints (sm/md/lg/xl)
- Touch-friendly interfaces
- Swipe gestures cho mobile navigation
- PWA-ready với service workers

**5. RESTful API Design:**
- Resource-based URLs: `/api/stores`, `/api/orders`
- HTTP methods: GET, POST, PUT, DELETE
- JSON responses với consistent structure
- Pagination, filtering, sorting
- Rate limiting và request validation

#### Kỹ thuật xử lý

**Authentication & Security:**
- JWT tokens với expiration (24h)
- Refresh token mechanism
- Password hashing với bcrypt (salt rounds: 12)
- Role-based access control (store_owner, admin)
- Input sanitization và SQL injection prevention

**State Management:**
- Zustand stores: cartStore, userStore, uiStore
- Server state với SWR pattern
- Optimistic updates cho UX mượt mà
- Persistent state với localStorage

**Error Handling:**
- Global error boundaries (React)
- Centralized error logging
- User-friendly error messages
- Graceful degradation (offline mode)

**Performance Optimization:**
- Next.js ISR cho static pages
- Database indexing cho queries thường xuyên
- Image optimization pipeline
- Code splitting và lazy loading
- CDN deployment ready

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

### Hướng phát triển
- Thông báo email/SMS.  
- Thống kê nâng cao bằng biểu đồ.  
- Hệ thống đánh giá – xếp hạng.  
- Tìm kiếm/đề xuất món bằng AI, hỗ trợ đa ngôn ngữ.  
- Ứng dụng mobile (React Native).

---

## PHỤ LỤC

### A. API Documentation

#### Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

#### Store Management
```
GET    /api/stores/:storeSlug         # Public store info
GET    /api/stores                    # Owner's stores
POST   /api/stores                    # Create store
PUT    /api/stores/:id                # Update store
DELETE /api/stores/:id                # Delete store
GET    /api/stores/:id/qr             # Generate QR code
```

#### Menu Management
```
GET    /api/categories?storeId=:id     # List categories
POST   /api/categories                # Create category
PUT    /api/categories/:id            # Update category
DELETE /api/categories/:id            # Delete category

GET    /api/items?storeId=:id         # List items
POST   /api/items                     # Create item
PUT    /api/items/:id                 # Update item
DELETE /api/items/:id                 # Delete item
POST   /api/items/:id/image           # Upload item image
```

#### Order Management
```
GET    /api/orders?storeId=:id         # List orders
GET    /api/orders/:id                 # Order details
PUT    /api/orders/:id/status         # Update order status
POST   /api/orders/public              # Create order (public)
GET    /api/orders/track/:code         # Track order
```

#### Analytics
```
GET /api/analytics/overview?storeId=:id&period=:period
GET /api/analytics/revenue?storeId=:id&period=:period
GET /api/analytics/orders?storeId=:id&period=:period
```

#### Payment Integration
```
GET    /api/payment-accounts?storeId=:id
POST   /api/payment-accounts
PUT    /api/payment-accounts/:id
DELETE /api/payment-accounts/:id

POST   /api/zalopay/create-order
GET    /api/zalopay/callback
POST   /api/bank-transfer/verify
```

#### Voucher System
```
GET    /api/vouchers?storeId=:id
POST   /api/vouchers
PUT    /api/vouchers/:id
DELETE /api/vouchers/:id
POST   /api/vouchers/validate
```

### B. Cấu trúc Frontend

#### Pages Structure
```
pages/
├── _app.jsx              # App wrapper với providers
├── _document.jsx         # HTML document structure
├── index.jsx             # Landing page
├── login.jsx             # Authentication
├── register.jsx          # Registration
├── store/[slug].jsx      # Public store menu
├── checkout.jsx          # Order checkout
├── track-order.jsx       # Order tracking
├── order-success/[id].jsx # Order confirmation
├── admin/
│   └── index.jsx         # Admin dashboard
└── dashboard/
    ├── index.jsx         # Store dashboard
    ├── menu.jsx          # Menu management
    ├── analytics.jsx     # Analytics view
    └── reviews.jsx       # Reviews management
```

#### Components Structure
```
components/
├── Layout.jsx            # Main layout wrapper
├── Header.jsx            # Navigation header
├── Footer.jsx            # Footer component
├── StoreMenu.jsx         # Public menu display
├── CartSidebar.jsx       # Shopping cart
├── OrderForm.jsx         # Checkout form
├── DashboardLayout.jsx   # Dashboard wrapper
├── MenuManager.jsx       # Menu CRUD interface
├── OrderList.jsx         # Orders table
├── AnalyticsCharts.jsx   # Charts component
├── QRCodeGenerator.jsx   # QR code display
├── ImageUpload.jsx       # Image crop/upload
└── Toast.jsx             # Notification system
```

#### State Management (Zustand)
```javascript
// Cart Store
const useCartStore = create((set, get) => ({
  items: [],
  total: 0,
  addItem: (item) => { /* logic */ },
  removeItem: (id) => { /* logic */ },
  clearCart: () => { /* logic */ }
}))

// User Store
const useUserStore = create((set) => ({
  user: null,
  store: null,
  login: (userData) => { /* logic */ },
  logout: () => { /* logic */ }
}))

// UI Store
const useUIStore = create((set) => ({
  loading: false,
  sidebarOpen: false,
  setLoading: (state) => { /* logic */ }
}))
```


---

## 📚 Documentation Chi Tiết

- **[Kiến trúc hệ thống](docs/ARCHITECTURE.md)** - Chi tiết về design patterns và architecture decisions
- **[API Documentation](docs/API.md)** - Đầy đủ API endpoints với examples
- **[Database Schema](docs/DATABASE.md)** - ER diagram và table specifications
- **[Deployment Guide](database/README.md)** - Hướng dẫn triển khai và migration

---

⭐ Nếu dự án này hữu ích, hãy cho một star!

Made with ❤️ by Nguyễn Duy Quang

</div>
