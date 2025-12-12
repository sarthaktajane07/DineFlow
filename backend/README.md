# DineFlow Backend API

Complete backend API for the DineFlow Restaurant Management System built with Node.js, Express, MongoDB, Socket.IO, and JWT authentication.

## 🚀 Features

- **RESTful API** for tables, waitlist, and user management
- **JWT Authentication** with role-based authorization (Manager, Host, Staff)
- **Real-Time Updates** via Socket.IO for instant table status and waitlist changes
- **SMS/WhatsApp Notifications** via Twilio when tables are ready
- **MongoDB** for data persistence
- **Historical Service Metrics** for analytics and performance tracking
- **Security Features** including helmet, CORS, and rate limiting

## 📋 Prerequisites

- Node.js >= 16.x
- MongoDB >= 5.x (local or Atlas)
- Twilio account (for SMS/WhatsApp - optional for development)

## 🛠️ Installation

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and configure:
- MongoDB connection string
- JWT secret
- Twilio credentials (optional)
- Server port

## ⚙️ Configuration

### Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/dineflow

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Twilio (optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=+1234567890

# CORS
CLIENT_URL=http://localhost:3001
```

## 🚀 Running the Server

### Development Mode (with nodemon):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/update-profile` | Private | Update profile |
| PUT | `/api/auth/update-password` | Private | Change password |

### Tables

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tables` | Private | Get all tables |
| POST | `/api/tables` | Manager | Create new table |
| GET | `/api/tables/:id` | Private | Get single table |
| PUT | `/api/tables/:id` | Private | Update table status |
| DELETE | `/api/tables/:id` | Manager | Delete table |
| GET | `/api/tables/stats/overview` | Private | Get table statistics |

### Waitlist

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/waitlist` | Private | Get waitlist |
| POST | `/api/waitlist` | Host/Manager | Add to waitlist |
| GET | `/api/waitlist/:id` | Private | Get waitlist entry |
| PUT | `/api/waitlist/:id` | Host/Manager | Update entry |
| DELETE | `/api/waitlist/:id` | Host/Manager | Remove from waitlist |
| POST | `/api/waitlist/:id/notify` | Host/Manager | Notify guest (table ready) |
| POST | `/api/waitlist/:id/seat` | Host/Manager | Seat guest at table |
| GET | `/api/waitlist/stats/overview` | Private | Get waitlist statistics |

## 🔐 Authentication

### Login Request:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dineflow.com",
    "password": "admin123"
  }'
```

### Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "fullName": "Admin User",
      "email": "admin@dineflow.com",
      "role": "manager"
    }
  }
}
```

### Using the Token:
```bash
curl -X GET http://localhost:5000/api/tables \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 👥 User Roles

### Manager
- Full access to all features
- Can create/delete tables
- Can manage users
- Can view all analytics

### Host
- Manage waitlist (add/remove/notify guests)
- Seat guests at tables
- Update table status
- View statistics

### Staff
- View tables and waitlist
- Update table status
- Limited administrative access

## 🔌 Socket.IO Events

### Client → Server

```javascript
socket.emit('authenticate', token);
socket.emit('join_restaurant', restaurantId);
```

### Server → Client

```javascript
// Table events
socket.on('table:created', (data) => { /* ... */ });
socket.on('table:updated', (data) => { /* ... */ });
socket.on('table:deleted', (data) => { /* ... */ });

// Waitlist events
socket.on('waitlist:added', (data) => { /* ... */ });
socket.on('waitlist:updated', (data) => { /* ... */ });
socket.on('waitlist:removed', (data) => { /* ... */ });

// Notification events
socket.on('notification:sent', (data) => { /* ... */ });
socket.on('guest:seated', (data) => { /* ... */ });

// Activity events
socket.on('activity:new', (data) => { /* ... */ });
```

## 📊 Data Models

### User
- fullName, email, password (hashed)
- role: manager | host | staff
- isActive, lastLogin

### Table
- tableNumber, seats, status (free/occupied/reserved/cleaning)
- zone (indoor/outdoor/bar/vip)
- position (x, y), shape
- currentGuest, assignedWaiter

### WaitlistEntry
- guestName, phoneNumber, partySize
- status (waiting/notified/seated/cancelled/no-show)
- priority (normal/vip/reservation)
- estimatedWaitTime, actualWaitTime
- notificationPreference (sms/whatsapp/both)

### ServiceHistory
- table, waitlistEntry, waiter
- seatedAt, leftAt, serviceDuration
- waitTime, revenue, rating
- dayOfWeek, shift (breakfast/lunch/dinner/late-night)

## 📱 Twilio Integration

The backend integrates with Twilio for SMS/WhatsApp notifications:

### Without Twilio Credentials
- Notifications run in "mock mode"
- Messages are logged to console
- All features work normally

### With Twilio Credentials
- Real SMS messages sent to guests
- WhatsApp notifications supported
- Automatic table-ready alerts

## 🧪 Testing the API

### Create a Table:
```bash
curl -X POST http://localhost:5000/api/tables \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tableNumber": "1",
    "seats": 4,
    "zone": "indoor",
    "shape": "square"
  }'
```

### Add to Waitlist:
```bash
curl -X POST http://localhost:5000/api/waitlist \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "John Doe",
    "phoneNumber": "+1234567890",
    "partySize": 4,
    "estimatedWaitTime": 30,
    "notificationPreference": "sms"
  }'
```

### Seat a Guest:
```bash
curl -X POST http://localhost:5000/api/waitlist/ENTRY_ID/seat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": "TABLE_ID"
  }'
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── tableController.js   # Table management
│   │   └── waitlistController.js # Waitlist management
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   └── errorHandler.js     # Error handling
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Table.js            # Table schema
│   │   ├── WaitlistEntry.js    # Waitlist schema
│   │   └── ServiceHistory.js   # Service metrics schema
│   ├── routes/
│   │   ├── authRoutes.js       # Auth endpoints
│   │   ├── tableRoutes.js      # Table endpoints
│   │   └── waitlistRoutes.js   # Waitlist endpoints
│   ├── services/
│   │   └── twilioService.js    # Twilio integration
│   ├── socket/
│   │   └── socketHandler.js    # Socket.IO events
│   ├── utils/
│   │   └── jwt.js              # JWT utilities
│   └── server.js               # Main server file
├── .env                        # Environment variables
├── .env.example                # Example environment file
├── .gitignore
├── package.json
└── README.md
```

## 🔒 Security Features

- **Helmet** - Sets secure HTTP headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevents abuse
- **JWT** - Secure token-based authentication
- **bcrypt** - Password hashing
- **Input Validation** - Mongoose validators
- **Role-Based Access Control** - Authorization middleware

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running locally
mongod

# Or use MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dineflow
```

### Port Already in Use
```bash
# Change port in .env
PORT=5001
```

### Twilio Not Working
- Check credentials in `.env`
- Verify phone numbers are in E.164 format
- In development, mock mode works without credentials

## 📈 Performance

- **Indexed queries** for faster database operations
- **Compression** middleware for reduced payload size
- **Connection pooling** for MongoDB
- **Async/await** for non-blocking operations

## 🚢 Deployment

### Production Checklist:
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure MongoDB Atlas
- [ ] Set up Twilio production credentials
- [ ] Enable SSL/HTTPS
- [ ] Configure reverse proxy (nginx)
- [ ] Set up PM2 or similar process manager
- [ ] Configure environment variables properly

### PM2 Example:
```bash
npm install -g pm2
pm2 start src/server.js --name dineflow-backend
pm2 save
pm2 startup
```

## 📝 License

MIT

## 🤝 Support

For issues or questions, please contact the development team.

---

Built with ❤️ for DineFlow Restaurant Management System
