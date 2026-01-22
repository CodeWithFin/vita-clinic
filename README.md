# Vita Clinic - VitaPharm Wellness Clinic Management System

A comprehensive booking and queue management system built with Next.js, TypeScript, and PostgreSQL.

## 🚀 Features Implemented

### ✅ Module 1: Authentication & Authorization
- User login with role-based access control
- Support for Admin, Receptionist, and Service Provider roles
- Session management with NextAuth.js
- Protected dashboard routes

### ✅ Module 2: Client Management
- Client registration with auto-generated unique IDs
- Advanced search (by name, phone, client ID, email)
- Client profile management
- Skin type and health information tracking
- Emergency contact management

### 🚧 In Progress
- Service Catalog Management
- Appointment Booking System
- Queue Management
- Billing & Payments

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS (spa-inspired design)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Ready for Vercel/Railway

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd vita-clinic

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start development server
npm run dev
```

## 🔑 Default Login Credentials

After seeding the database:

- **Admin**: `admin` / `admin123`
- **Receptionist**: `receptionist` / `receptionist123`
- **Aesthetician**: `aesthetician` / `aesthetician123`
- **Therapist**: `therapist` / `therapist123`

## 📁 Project Structure

```
vita-clinic/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Protected dashboard pages
│   ├── login/            # Authentication page
│   └── page.tsx          # Landing page
├── components/           # Reusable components
├── lib/                  # Utilities and configurations
├── prisma/              # Database schema and migrations
└── types/               # TypeScript type definitions
```

## 🎨 Design System

The UI follows a spa-inspired aesthetic with:
- Elegant serif fonts (Cormorant Garamond, Cinzel)
- Stone/earth tone color palette
- Smooth transitions and micro-interactions
- Professional, calming interface

## 📝 Database Schema

Key models:
- **User** - Staff accounts with roles and specializations
- **Client** - Customer records with medical history
- **Service** - Treatment catalog
- **Appointment** - Booking records
- **QueueEntry** - Daily queue management
- **Payment** - Financial transactions
- **ServiceRecord** - Treatment documentation

## 🔄 Development Workflow

1. Features are developed module by module
2. Each module is tested before commit
3. Git commits use clear, descriptive messages
4. Code is pushed to GitHub regularly

## 📖 PRD Reference

Full Product Requirements Document available in `prd_backup.md`

## 🤝 Contributing

This is a private project for VitaPharm. Contact the development team for access.

## 📄 License

Proprietary - VitaPharm Wellness Clinic

---

**Current Status**: Module 3 of 13 completed ✅
