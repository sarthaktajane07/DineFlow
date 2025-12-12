# DineFlow Backend - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Start MongoDB
Make sure MongoDB is running on your system:

**Mac (with Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Or use MongoDB Atlas** (cloud):
- Create account at mongodb.com/atlas
- Create a free cluster
- Get connection string and update `.env`

### Step 3: Configure Environment
The `.env` file is already configured with defaults. You can customize:

```env
PORT=5000                                    # Server port
MONGODB_URI=mongodb://localhost:27017/dineflow  # Database
JWT_SECRET=dineflow_super_secret...           # JWT secret
CLIENT_URL=http://localhost:3001             # Frontend URL
```

**Optional - Twilio (for SMS/WhatsApp):**
- Sign up at twilio.com
- Add credentials to `.env`
- Works in mock mode without credentials

### Step 4: Initialize Database
Run the setup script to create default users and tables:

```bash
npm run setup
```

This creates:
- **Manager** account: admin@dineflow.com / admin123
- **Host** account: host@dineflow.com / host123
- **Staff** account: staff@dineflow.com / staff123
- 8 sample tables

### Step 5: Start the Server
```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║   🍽️  DineFlow Backend API Server   ║
╚════════════════════════════════════════╝

✅ Server running in development mode
🌐 API: http://localhost:5000
🔌 Socket.IO: http://localhost:5000
📡 Client URL: http://localhost:3001
```

### Step 6: Test the API

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dineflow.com",
    "password": "admin123"
  }'
```

Save the token from the response!

**Get Tables:**
```bash
curl http://localhost:5000/api/tables \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🎯 Common Tasks

### Add to Waitlist
```bash
curl -X POST http://localhost:5000/api/waitlist \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "John Doe",
    "phoneNumber": "+1234567890",
    "partySize": 4,
    "estimatedWaitTime": 20
  }'
```

### Update Table Status
```bash
curl -X PUT http://localhost:5000/api/tables/TABLE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "occupied"}'
```

### Notify Guest (Table Ready)
```bash
curl -X POST http://localhost:5000/api/waitlist/ENTRY_ID/notify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tableNumber": "5"}'
```

### Seat Guest at Table
```bash
curl -X POST http://localhost:5000/api/waitlist/ENTRY_ID/seat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tableId": "TABLE_ID"}'
```

## 🔌 Socket.IO Client Example

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

// Authenticate
socket.emit('authenticate', YOUR_JWT_TOKEN);

// Listen for table updates
socket.on('table:updated', (data) => {
  console.log('Table updated:', data);
});

// Listen for waitlist updates
socket.on('waitlist:added', (data) => {
  console.log('New guest added:', data);
});

// Listen for notifications
socket.on('notification:sent', (data) => {
  console.log('Guest notified:', data);
});
```

## 📊 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Tables
- `GET /api/tables` - List all tables
- `POST /api/tables` - Create table (Manager only)
- `GET /api/tables/:id` - Get single table
- `PUT /api/tables/:id` - Update table
- `DELETE /api/tables/:id` - Delete table (Manager only)
- `GET /api/tables/stats/overview` - Get statistics

### Waitlist
- `GET /api/waitlist` - List waitlist
- `POST /api/waitlist` - Add guest (Host/Manager)
- `GET /api/waitlist/:id` - Get entry
- `PUT /api/waitlist/:id` - Update entry
- `DELETE /api/waitlist/:id` - Remove guest
- `POST /api/waitlist/:id/notify` - Notify guest (table ready)
- `POST /api/waitlist/:id/seat` - Seat guest
- `GET /api/waitlist/stats/overview` - Get statistics

## 🐛 Troubleshooting

### "MongoDB connection error"
- Ensure MongoDB is running: `brew services list` (Mac) or `sudo systemctl status mongod` (Linux)
- Or use MongoDB Atlas cloud database

### "Port 5000 already in use"
- Change PORT in `.env` to `5001` or another available port

### "Twilio not configured"
- This is normal! Backend works in mock mode without Twilio
- Notifications will be logged to console instead

### "Cannot find module"
- Run `npm install` to install dependencies
- Make sure you're in the `backend` directory

## ✅ Next Steps

1. **Connect your frontend** to http://localhost:5000
2. **Test the API** using the examples above
3. **Set up Twilio** (optional) for real SMS notifications
4. **Customize tables** and settings via the API
5. **Deploy to production** when ready

## 📚 Full Documentation

See `README.md` for complete API documentation, security features deployment guide, and more.

---

Need help? Check the `README.md` or contact the development team.
