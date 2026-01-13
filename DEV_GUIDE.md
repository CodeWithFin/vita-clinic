# Development Guide

## 🚀 System is Running!

Both servers are up and operational:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Backend Health**: http://localhost:3000/health

## 🔐 Getting OTP Codes (Development Mode)

Since email SMTP is not configured, OTPs are printed to the backend console.

### How to See OTPs:

**Option 1: Watch the backend log in real-time**
```bash
tail -f /tmp/backend.log | grep "OTP"
```

**Option 2: Check recent OTPs**
```bash
tail -50 /tmp/backend.log | grep "OTP"
```

### Example Output:
```
🔐 OTP for test@example.com: 836825
```

## 📋 Test Accounts

### Admin/Staff Login
- **URL**: http://localhost:5173/staff-login
- **Email**: `admin@vitapharm.com`
- **Password**: `admin123`

### Patient Login (OTP)
- **URL**: http://localhost:5173/login
- **Email**: Any email address (e.g., `patient@test.com`)
- **OTP**: Check the backend logs (see above)

## 🧪 Testing Workflow

### 1. Test Patient Flow
1. Go to http://localhost:5173/login
2. Enter email: `patient@test.com`
3. Check backend log for OTP: `tail -f /tmp/backend.log | grep OTP`
4. Enter the OTP code
5. Book an appointment
6. Check live queue

### 2. Test Receptionist Flow
1. Login as admin
2. Go to User Management
3. Create a receptionist account
4. Logout and login as receptionist
5. Register a walk-in patient
6. Manage bookings
7. Control the queue

### 3. Test Doctor Flow
1. Login as admin
2. Create a doctor account
3. Logout and login as doctor
4. View patient records
5. Call next patient
6. Write prescription

### 4. Test Admin Flow
1. Login as admin
2. Manage users
3. Configure system settings
4. View analytics

## 🔧 Troubleshooting

### Backend Not Responding
```bash
# Check if backend is running
ps aux | grep "node --watch"

# Check backend logs
tail -50 /tmp/backend.log

# Restart backend
cd backend && npm run dev
```

### Frontend Not Loading
```bash
# Check if frontend is running
ps aux | grep "vite"

# Check frontend logs
tail -50 /tmp/frontend.log

# Restart frontend
cd frontend && npm run dev
```

### Database Issues
```bash
# Re-run migrations
cd backend && npm run migrate

# Check PostgreSQL is running
sudo systemctl status postgresql
```

## 📧 Configuring Real Email (Optional)

To send real OTP emails, update `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Get from Google Account Settings
SMTP_FROM=Vitapharm Clinic <noreply@vitapharm.com>
```

### Gmail App Password Setup:
1. Enable 2-Factor Authentication on your Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an app password
4. Use that password in `SMTP_PASS`

## 🎯 Quick Commands

```bash
# View OTPs in real-time
tail -f /tmp/backend.log | grep "🔐"

# Check server health
curl http://localhost:3000/health

# Test OTP generation
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# View all backend logs
tail -100 /tmp/backend.log

# View all frontend logs
tail -100 /tmp/frontend.log
```

## 🐛 Common Issues

### "Empty string passed to getElementById"
This is a browser warning and doesn't affect functionality. Can be ignored.

### "401 Unauthorized" on OTP verify
- Make sure you're using the correct OTP from the logs
- OTPs expire after 10 minutes
- Each OTP can only be used once

### "500 Internal Server Error"
- Check backend logs: `tail -50 /tmp/backend.log`
- Usually means database isn't set up: `cd backend && npm run migrate`

## ✅ System Features Working

- [x] Patient OTP authentication
- [x] Staff password authentication
- [x] Real-time queue management (WebSocket)
- [x] Appointment booking
- [x] Patient records
- [x] Digital prescriptions
- [x] User management (admin)
- [x] System configuration
- [x] Role-based access control

## 🎨 UI Features

- [x] Modern, responsive design
- [x] Gamification elements (progress rings, badges)
- [x] Real-time updates
- [x] Smooth animations
- [x] Mobile-friendly

---

**Happy Testing! 🏥✨**

For more information, see:
- [README.md](./README.md) - Full documentation
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Setup instructions
- [FEATURES.md](./FEATURES.md) - Feature details

