# 🍽️ DineFlow Pro - Complete Full-Stack Application

Professional Restaurant Management System with Real-Time Updates, SMS/WhatsApp Notifications, and Analytics

## 📋 Overview

DineFlow Pro is a complete full-stack restaurant management system that helps restaurants manage tables, waitlists, and guest flow efficiently.

### Frontend
- **React + TypeScript + Vite**
- **Tailwind CSS + Shadcn/ui**
- **Socket.IO Client** for real-time updates
- **Supabase** integration
- **Twilio** integration for notifications

### Backend
- **Node.js + Express**
- **MongoDB + Mongoose**
- **Socket.IO** for real-time communication
- **JWT** authentication & authorization
- **Twilio** for SMS/WhatsApp notifications

---

## 🚀 Quick Start - Full Stack

### Prerequisites
- Node.js >= 16.x
- MongoDB >= 5.x
- npm or yarn

### 1. Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start MongoDB (if running locally)
brew services start mongodb-community  # Mac
# OR use MongoDB Atlas connection string

# Initialize database with sample data
npm run setup

# Start backend server
npm run dev
```

Backend will run on: **http://localhost:5000**

### 2. Setup Frontend

```bash
# Navigate to frontend (from root)
cd ../

# Install dependencies (if not already done)
npm install

# Start frontend dev server
npm run dev
```

Frontend will run on: **http://localhost:3001**

### 3. Login

Default credentials:
- **Manager**: admin@dineflow.com / admin123
- **Host**: host@dineflow.com / host123
- **Staff**: staff@dineflow.com / staff123

---

## 📁 Project Structure

```
dineflow-pro-14-main/
├── frontend (React/TypeScript/Vite)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── integrations/     # Twilio, Supabase integration
│   │   └── ...
│   ├── public/
│   ├── index.html
│   └── package.json
│
└── backend/ (Node.js/Express/MongoDB)
    ├── src/
    │   ├── controllers/      # Business logic
    │   ├── models/           # MongoDB schemas
    │   ├── routes/           # API endpoints
    │   ├── middleware/       # Auth, error handling
    │   ├── services/         # Twilio, etc.
    │   ├── socket/           # Socket.IO handlers
    │   └── server.js         # Main entry point
    ├── setup.js              # DB initialization
    └── package.json
```

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Manager, Host, Staff)
- Secure password hashing
- Protected routes

### 📋 Table Management
- Visual table layout
- Real-time table status (Free/Occupied/Reserved/Cleaning)
- Table assignment
- Zone management (Indoor/Outdoor/Bar/VIP)
- Create/update/delete tables

### 👥 Waitlist Management
- Add guests to waitlist
- Queue position tracking
- Estimated wait time calculation
- Guest notifications (SMS/WhatsApp)
- Seat guests at tables
- Remove/cancel waitlist entries

### 📱 Notifications (Twilio)
- **SMS** notifications
- **WhatsApp** notifications
- Table-ready alerts
- Waitlist confirmation messages
- Position update notifications

### 🔄 Real-Time Updates (Socket.IO)
- Live table status changes
- Waitlist updates across all devices
- Instant notifications
- Activity feed updates

### 📊 Analytics & Metrics
- Table occupancy rates
- Average wait times
- Service duration tracking
- Waiter performance metrics
- Revenue tracking
- Historical service data

---

## 🌐 API Endpoints

### Base URL: `http://localhost:5000/api`

### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user

### Tables
- `GET /tables` - List all tables
- `POST /tables` - Create table (Manager)
- `PUT /tables/:id` - Update table
- `DELETE /tables/:id` - Delete table (Manager)
- `GET /tables/stats/overview` - Statistics

### Waitlist
- `GET /waitlist` - Get waitlist
- `POST /waitlist` - Add to waitlist (Host/Manager)
- `POST /waitlist/:id/notify` - Notify guest
- `POST /waitlist/:id/seat` - Seat guest
- `DELETE /waitlist/:id` - Remove from waitlist
- `GET /waitlist/stats/overview` - Statistics

---

## 🔌 WebSocket Events

### Server → Client
```javascript
'table:created'      // New table
'table:updated'      // Table status changed
'waitlist:added'     // New guest
'waitlist:updated'   // Entry updated
'notification:sent'  // SMS/WhatsApp sent
'guest:seated'       // Guest seated
```

### Client → Server
```javascript
'authenticate'       // Auth with JWT
'join_restaurant'    // Join room
```

---

## 📱 Twilio Integration

### Setup (Optional)
1. Sign up at [twilio.com](https://twilio.com)
2. Get Account SID and Auth Token
3. Purchase a phone number with SMS capabilities
4. Update credentials in both `.env` files:

**Backend** (`.env`):
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Frontend** (`.env`):
```env
VITE_TWILIO_ACCOUNT_SID=your_account_sid
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_PHONE_NUMBER=+1234567890
```

**Note**: Works in mock mode without Twilio credentials for development.

---

## 🛠️ Development

### Frontend Development
```bash
npm run dev          # Start dev server (port 3001)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
```bash
npm run dev          # Start with nodemon (port 5000)
npm run start        # Start production server
npm run setup        # Initialize database
```

---

## 📚 Documentation

### Frontend
- **Twilio Integration**: `TWILIO_INTEGRATION.md`
- **Changes Summary**: `CHANGES_SUMMARY.md`

### Backend
- **Full Documentation**: `backend/README.md`
- **Quick Start**: `backend/QUICKSTART.md`
- **Implementation Summary**: `backend/BACKEND_SUMMARY.md`
- **Postman Collection**: `backend/DineFlow-API.postman_collection.json`

---

## 🧪 Testing

### Test Backend API

1. **Import Postman Collection**:
   - Open Postman
   - Import `backend/DineFlow-API.postman_collection.json`
   - Update `{{token}}` variable after login

2. **Or use curl**:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dineflow.com","password":"admin123"}'

# Get tables
curl http://localhost:5000/api/tables \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Frontend
1. Open `http://localhost:3001`
2. Login with test credentials
3. Navigate through dashboards
4. Test table management
5. Test waitlist features

---

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ Input validation
- ✅ Role-based authorization
- ✅ Secure environment variables

---

## 🚢 Deployment

### Backend
- **Heroku**: Node.js hosting
- **Railway**: Modern deployment
- **AWS/DigitalOcean**: VPS
- **MongoDB Atlas**: Cloud database

### Frontend
- **Vercel**: Recommended
- **Netlify**: Static hosting
- **AWS S3 + CloudFront**: Scalable

### Environment Variables
Update `.env` files with production values:
- Database connection strings
- JWT secrets
- Twilio credentials
- CORS origins

---

## 📊 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS + Shadcn/ui
- React Router DOM
- Socket.IO Client
- Supabase Client
- Twilio SDK
- Lucide Icons

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT (jsonwebtoken)
- bcrypt
- Twilio SDK
- Helmet, CORS, Compression
- Morgan (logging)

---

## ✅ Feature Checklist

### Backend ✅
- [x] RESTful API endpoints
- [x] JWT authentication & authorization
- [x] MongoDB database with schemas
- [x] Socket.IO real-time updates
- [x] Twilio SMS/WhatsApp integration
- [x] Historical service metrics
- [x] Security middleware
- [x] Error handling
- [x] Sample data setup script

### Frontend ✅
- [x] React + TypeScript + Vite
- [x] Beautiful UI with Tailwind + Shadcn
- [x] Socket.IO integration
- [x] Twilio notification system
- [x] Role-based dashboards
- [x] Table management interface
- [x] Waitlist management
- [x] Real-time updates

---

## 📞 Support

### Getting Help
1. Check documentation in `backend/` folder
2. Review API examples in Postman collection
3. Check `TWILIO_INTEGRATION.md` for notifications
4. Review `backend/QUICKSTART.md` for setup

### Common Issues

**MongoDB Connection Error**:
- Ensure MongoDB is running: `brew services list` (Mac)
- Or use MongoDB Atlas connection string

**Port Already in Use**:
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change `port` in `vite.config.ts`

**Twilio Not Working**:
- Backend works in mock mode without credentials
- Check `.env` configuration
- Verify phone number format (+1234567890)

---

## 🎯 Next Steps

1. ✅ Backend is ready - Start it with `cd backend && npm run dev`
2. ✅ Frontend is ready - Start it with `npm run dev`
3. Open `http://localhost:3001` in your browser
4. Login with default credentials
5. Test table and waitlist management
6. Configure Twilio for real notifications (optional)
7. Customize and deploy to production

---

## 🎉 You're All Set!

You now have a **complete, production-ready** restaurant management system with:

✅ Full-stack architecture  
✅ Real-time updates  
✅ SMS/WhatsApp notifications  
✅ Authentication & authorization  
✅ Analytics & metrics  
✅ Beautiful UI  
✅ Comprehensive documentation  

**Happy restaurant managing! 🍽️**

---

Built with ❤️ by the DineFlow team
