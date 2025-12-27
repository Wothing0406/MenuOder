# Kiến Trúc Hệ Thống MenuOrder

## Tổng Quan

MenuOrder là hệ thống quản lý menu và đặt hàng online được xây dựng với kiến trúc microservices-ready, sử dụng Next.js cho frontend và Node.js/Express cho backend.

## Kiến Trúc Chi Tiết

### 1. Frontend Layer (Next.js)

**Công nghệ:**
- Next.js 14 với App Router
- React 18 với Concurrent Features
- Tailwind CSS cho styling
- Zustand cho state management

**Cấu trúc:**
```
frontend/
├── app/                 # App Router (Next.js 13+)
├── components/          # Reusable components
├── lib/                 # Utilities & configurations
├── public/              # Static assets
└── styles/              # Global styles
```

**Trang chính:**
- `/` - Landing page
- `/store/[slug]` - Menu công khai
- `/checkout` - Thanh toán
- `/dashboard/*` - Quản lý cửa hàng
- `/admin/*` - Quản trị hệ thống

### 2. Backend Layer (Express.js)

**Công nghệ:**
- Node.js 18+ với Express 4.18
- Sequelize ORM cho database
- JWT cho authentication
- Multer cho file upload

**Cấu trúc:**
```
backend/src/
├── config/              # Database, Cloudinary config
├── controllers/         # Business logic (13 controllers)
├── middleware/          # Auth, validation, CORS
├── models/              # Sequelize models (12 models)
├── routes/              # API routes (15 route files)
└── utils/               # Helper functions
```

**API Structure:**
- RESTful endpoints
- Consistent response format
- Input validation
- Error handling

### 3. Database Layer

**Hỗ trợ:**
- MySQL 8.0+
- PostgreSQL 15+
- Sequelize ORM với migrations

**Schema Design:**
- Normalized relationships
- Indexes cho performance
- Foreign key constraints
- UTF8MB4 encoding

### 4. External Services

**Cloudinary:**
- Image upload & optimization
- CDN delivery
- Transformations (resize, crop, format)

**Payment Gateways:**
- ZaloPay integration
- Bank transfer verification
- QR code generation

## Data Flow

### User Journey

1. **Khách hàng quét QR**
   ```
   QR Code → /store/[slug] → Menu Display
   ```

2. **Đặt hàng**
   ```
   Menu → Cart → Checkout → Order Creation → Confirmation
   ```

3. **Chủ quán quản lý**
   ```
   Dashboard → CRUD Operations → Real-time Updates
   ```

### API Flow

```
Client Request → Middleware (Auth/Validation) → Controller → Model → Database
                      ↓
                Response ← Formatted Data ← Query Result
```

## Security

### Authentication
- JWT tokens với expiration
- Password hashing (bcrypt)
- Role-based access control

### Data Protection
- Input sanitization
- SQL injection prevention
- XSS protection
- CORS configuration

## Performance

### Frontend Optimizations
- Next.js ISR/SSG
- Image optimization
- Code splitting
- Lazy loading

### Backend Optimizations
- Database indexing
- Query optimization
- Caching strategies
- Rate limiting

### Infrastructure
- CDN cho static assets
- Database connection pooling
- Horizontal scaling ready

## Deployment

### Development
- Local development với hot reload
- Docker support (optional)
- Environment-based configuration

### Production
- Railway/Render cho backend
- Vercel/Netlify cho frontend
- AWS RDS/Supabase cho database
- Cloudinary cho media storage

## Monitoring & Logging

### Error Tracking
- Global error handlers
- Structured logging
- User-friendly error messages

### Performance Monitoring
- Response time tracking
- Database query monitoring
- Memory usage monitoring

## Future Extensibility

### Microservices Ready
- Modular controller structure
- Service layer abstraction
- API versioning support

### Scalability
- Database sharding ready
- CDN integration
- Cache layer ready

### Feature Extensions
- Real-time WebSocket
- Mobile app (React Native)
- Multi-language support
- Advanced analytics
