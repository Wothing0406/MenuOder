# Tech Stack & Build System

## Kiến trúc tổng thể
- **Monorepo:** Frontend và Backend trong cùng workspace
- **Database:** MySQL (có thể chuyển PostgreSQL)
- **File Storage:** Cloudinary cho hình ảnh
- **Deployment:** Vercel (Frontend) + Render (Backend)

## Backend Stack
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database ORM:** Sequelize
- **Authentication:** JWT + bcryptjs
- **File Upload:** Multer + Cloudinary
- **Payment:** ZaloPay API, VietQR
- **Validation:** express-validator

## Frontend Stack
- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **HTTP Client:** Axios
- **UI Components:** Custom components
- **Notifications:** react-hot-toast

## Development Commands

### Backend
```bash
cd backend
npm run dev          # Start development server
npm run start        # Start production server
npm run test-db      # Test database connection
npm run test-api     # Test API endpoints
```

### Migration Commands
```bash
npm run migrate:all                    # Run all migrations
npm run migrate:payment-accounts       # Add payment accounts table
npm run migrate:payment-data          # Migrate existing payment data
npm run reset-db                      # Reset database
npm run sync-schema                   # Sync database schema
```

### Frontend
```bash
cd frontend
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
```

### Root Commands
```bash
npm run host:backend   # Start backend only
npm run host:frontend  # Start frontend only
npm run host          # Start both concurrently
```

## Environment Variables

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=menu_order_db
DB_USER=root
DB_PASSWORD=

# Server
PORT=5003
HOST=localhost
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=24h

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin
ADMIN_SECRET_KEY=your_admin_secret
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5003/api
```

## Database Management
- **Migrations:** SQL files in `/database` folder
- **Seeding:** `database/seed.sql`
- **Schema:** `database/schema.sql`
- **Reset:** Use `npm run reset-db` script

## API Structure
- **Base URL:** `/api`
- **Authentication:** Bearer token in Authorization header
- **Admin Routes:** Require `X-Admin-Secret` header
- **Public Routes:** No authentication required

## Build & Deployment
- **Frontend:** Vercel (automatic deployment from Git)
- **Backend:** Render (Docker or Node.js deployment)
- **Database:** MySQL on cloud provider (PlanetScale, Railway, etc.)

## Development Workflow
1. Start backend: `npm run host:backend`
2. Start frontend: `npm run host:frontend`
3. Access app: http://localhost:3000
4. API docs: http://localhost:5003/health