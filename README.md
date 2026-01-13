# Vitapharm Clinic Booking & Queueing System

A modern, real-time healthcare management platform designed to streamline patient booking, queue management, and clinical record handling.

![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Features

### For Patients
- **Passwordless Login** - Secure email OTP authentication
- **Real-time Queue** - Live updates on wait times and position
- **Appointment Booking** - Easy online scheduling
- **Digital Prescriptions** - Access medical records anytime
- **Gamified Experience** - Progress indicators and achievement badges

### For Receptionists
- **Patient Registration** - Quick walk-in patient onboarding
- **Booking Management** - Create and manage appointments
- **Queue Control** - Real-time queue management interface
- **Patient Search** - Fast patient lookup by email

### For Doctors
- **Patient Records** - Complete medical history access
- **Digital Prescriptions** - Create and manage prescriptions
- **Schedule Management** - Set and view availability
- **Queue Dashboard** - Call next patient with one click

### For Admins
- **User Management** - Add/edit/remove staff members
- **System Configuration** - Customize clinic settings
- **Analytics & Reports** - Track performance metrics
- **Audit Logs** - Complete system activity tracking

## 🏗️ Architecture

### Frontend
- **Framework**: Vite + Svelte
- **Styling**: Tailwind CSS
- **Real-time**: Socket.io Client
- **Routing**: Svelte Routing

### Backend
- **Framework**: Fastify (Node.js)
- **Database**: PostgreSQL
- **Authentication**: JWT + Custom OTP
- **Real-time**: WebSockets (@fastify/websocket)
- **Email**: Nodemailer

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn
- SMTP server access (for OTP emails)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vita-clinic
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 3. Database Setup

Create a PostgreSQL database:

```bash
createdb vitapharm_clinic
```

Configure environment variables:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vitapharm_clinic
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-jwt-key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Vitapharm Clinic <noreply@vitapharm.com>
```

Run database migrations:

```bash
npm run migrate
```

### 4. Start the Application

From the root directory:

```bash
# Start both frontend and backend
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **WebSocket**: ws://localhost:3000/ws

## 🔐 Default Credentials

### Admin Account
- **Email**: admin@vitapharm.com
- **Password**: admin123

### Test Patient
Patients use OTP login - just enter any email address to receive an OTP (check your SMTP configuration).

## 📚 API Documentation

### Authentication

#### Patient Login (OTP)
```bash
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "patient@example.com"
}
```

```bash
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "patient@example.com",
  "otp": "123456"
}
```

#### Staff Login
```bash
POST /api/auth/staff-login
Content-Type: application/json

{
  "email": "staff@vitapharm.com",
  "password": "password123"
}
```

### Protected Routes

All protected routes require the JWT token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

#### Patient Routes
- `GET /api/patient/dashboard` - Get patient dashboard
- `POST /api/patient/book` - Book appointment
- `GET /api/patient/queue` - Get queue status
- `GET /api/patient/prescriptions` - Get prescriptions

#### Receptionist Routes
- `GET /api/receptionist/dashboard` - Get dashboard
- `POST /api/receptionist/patients` - Register patient
- `GET /api/receptionist/bookings` - Get all bookings
- `POST /api/receptionist/bookings` - Create booking
- `GET /api/receptionist/queue` - Get queue
- `POST /api/receptionist/queue` - Add to queue
- `PUT /api/receptionist/queue/:id` - Update queue status

#### Doctor Routes
- `GET /api/doctor/dashboard` - Get dashboard
- `GET /api/doctor/patients/:id` - Get patient records
- `POST /api/doctor/prescriptions` - Create prescription
- `POST /api/doctor/queue/next` - Call next patient

#### Admin Routes
- `GET /api/admin/dashboard` - Get dashboard
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/config` - Get system config
- `PUT /api/admin/config` - Update config

## 🔌 WebSocket Events

### Client → Server
```javascript
{
  "type": "subscribe-queue"
}
```

### Server → Client
```javascript
{
  "type": "queue-update",
  "queue": [...],
  "myPosition": 3,
  "estimatedWait": 15
}
```

## 🗄️ Database Schema

The system uses the following main tables:

- **users** - All user accounts (patients, staff)
- **patients** - Patient-specific information
- **doctors** - Doctor-specific information
- **appointments** - Appointment bookings
- **queue** - Real-time queue management
- **visits** - Patient visit records
- **prescriptions** - Medical prescriptions
- **otps** - One-time passwords for authentication
- **audit_logs** - System activity logs
- **system_config** - Application configuration

## 🎨 Design System

The application uses a modern, healthcare-appropriate design:

**Colors:**
- `#f3f4ef` - Background
- `#0f1f12` - Text/Dark
- `#d4ff33` - Accent Lime
- `#ffb8d0` - Accent Pink
- `#4ade80` - Accent Green

**Typography:**
- Font Family: Inter
- Custom letter spacing for headers

## 🧪 Testing

### Manual Testing

1. **Patient Flow:**
   - Register via OTP
   - Book appointment
   - Check queue position
   - View prescriptions

2. **Receptionist Flow:**
   - Login with staff credentials
   - Register walk-in patient
   - Manage bookings
   - Update queue status

3. **Doctor Flow:**
   - Login with doctor credentials
   - View patient records
   - Call next patient
   - Write prescription

4. **Admin Flow:**
   - Login as admin
   - Add new staff member
   - Configure system settings
   - View reports

## 📦 Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
# Deploy dist folder to Vercel
```

### Backend (Any Node.js host)

```bash
cd backend
npm run build
npm start
```

### Environment Variables

Ensure all environment variables are set in your production environment:
- `DATABASE_URL` or individual DB connection variables
- `JWT_SECRET` (use a strong, random key)
- SMTP configuration for email
- `NODE_ENV=production`

## 🔒 Security Considerations

1. **JWT Secrets**: Use strong, random secrets in production
2. **Database**: Use connection pooling and prepared statements (already implemented)
3. **Rate Limiting**: Consider adding rate limiting middleware
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Configure appropriate CORS origins
6. **Password Hashing**: Uses bcrypt with 10 rounds (already implemented)

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check connection credentials in `.env`
- Ensure database exists: `createdb vitapharm_clinic`

### OTP Not Received
- Check SMTP configuration
- Verify SMTP credentials
- Check spam folder
- Enable "Less secure app access" for Gmail

### WebSocket Connection Failed
- Ensure backend is running on port 3000
- Check firewall settings
- Verify proxy configuration in `vite.config.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

Product & Engineering Team
- Built with ❤️ for better healthcare

## 📞 Support

For support, email support@vitapharm.com or open an issue on GitHub.

---

**Version**: 1.0.0  
**Last Updated**: January 2026

🌟 Star this repo if you find it helpful!

# vita-clinic
