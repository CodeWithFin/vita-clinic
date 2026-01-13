# Vitapharm Clinic - Quick Setup Guide

## 🚀 5-Minute Setup

### Step 1: Prerequisites Check

Ensure you have installed:
- [ ] Node.js v18+ (`node --version`)
- [ ] PostgreSQL v14+ (`psql --version`)
- [ ] npm (`npm --version`)

### Step 2: Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd vita-clinic

# Install all dependencies
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

### Step 3: Database Setup

```bash
# Create database
createdb vitapharm_clinic

# Or using psql:
psql -U postgres
CREATE DATABASE vitapharm_clinic;
\q

# Setup environment
cd backend
cp .env.example .env
```

### Step 4: Configure Environment

Edit `backend/.env`:

```env
# Minimum required configuration
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vitapharm_clinic
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD

# JWT Secret (generate a random string)
JWT_SECRET=your-random-secret-key-min-32-characters

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=Vitapharm Clinic <noreply@vitapharm.com>
```

**Gmail App Password Setup:**
1. Go to Google Account Settings
2. Security → 2-Step Verification (enable if not enabled)
3. App passwords → Generate app password
4. Copy the 16-character password to `SMTP_PASS`

### Step 5: Initialize Database

```bash
cd backend
npm run migrate
```

You should see: `✅ Database migrations completed successfully`

### Step 6: Start the Application

From the root directory:

```bash
npm run dev
```

Or start separately:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### Step 7: Access the Application

Open your browser:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

## 🔐 Default Login Credentials

### Admin
- **URL**: http://localhost:5173/staff-login
- **Email**: admin@vitapharm.com
- **Password**: admin123

### Patient (OTP)
- **URL**: http://localhost:5173/login
- **Email**: Any email address
- **OTP**: Check your email inbox

## 🧪 Quick Test

### Test Patient Flow:
1. Go to http://localhost:5173/login
2. Enter your email
3. Check email for OTP code
4. Enter OTP and login
5. Book an appointment

### Test Admin Flow:
1. Go to http://localhost:5173/staff-login
2. Login with admin credentials
3. Go to User Management
4. Add a test doctor/receptionist

## 🐛 Common Issues

### Issue: Database connection refused
**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql
```

### Issue: OTP email not received
**Solution:**
1. Check SMTP credentials in `.env`
2. Enable "Less secure app access" for Gmail
3. Check spam folder
4. Try using app-specific password

### Issue: Port 3000 already in use
**Solution:**
```bash
# Find process using port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in backend/.env
PORT=3001
```

### Issue: Module not found
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules */node_modules
npm install
cd frontend && npm install
cd ../backend && npm install
```

## 📁 Project Structure

```
vita-clinic/
├── frontend/                # Svelte + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # Svelte stores
│   │   └── lib/            # Utilities (API, WebSocket)
│   └── package.json
├── backend/                 # Fastify backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── db/             # Database setup
│   │   ├── utils/          # Utilities (email, OTP)
│   │   └── websocket/      # WebSocket handlers
│   └── package.json
├── prd.md                   # Product Requirements
└── README.md               # Full documentation
```

## 🎯 Next Steps

1. **Customize Design**: Edit colors in `frontend/tailwind.config.js`
2. **Add Doctors**: Use admin panel to add doctor accounts
3. **Add Receptionists**: Create receptionist accounts
4. **Configure Clinic**: Update system settings in admin panel
5. **Test Workflows**: Try all user flows

## 📞 Need Help?

- Check the full [README.md](./README.md) for detailed documentation
- Review [prd.md](./prd.md) for product requirements
- Check backend logs for error details
- Verify all environment variables are set correctly

## ✅ Verification Checklist

After setup, verify:
- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Admin login works
- [ ] Patient OTP email arrives
- [ ] Database has sample admin user
- [ ] WebSocket connection establishes

## 🎉 You're Ready!

Your Vitapharm Clinic system is now running!

**Quick Links:**
- Frontend: http://localhost:5173
- Admin Login: http://localhost:5173/staff-login
- API Health: http://localhost:3000/health

---

**Pro Tip**: Keep both terminal windows open to monitor backend and frontend logs during development.

