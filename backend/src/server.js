import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Import configurations
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import socketHandler from './socket/socketHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import waitlistRoutes from './routes/waitlistRoutes.js';

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3001',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});

// Initialize socket handler
socketHandler.initialize(io);

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:3001',
        credentials: true,
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.',
});

app.use('/api', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'DineFlow API is running',
        timestamp: new Date().toISOString(),
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/waitlist', waitlistRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;

httpServer.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║   🍽️  DineFlow Backend API Server   ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log(`✅ Server running in ${process.env.NODE_ENV} mode`);
    console.log(`🌐 API: http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO: http://localhost:${PORT}`);
    console.log(`📡 Client URL: ${process.env.CLIENT_URL}`);
    console.log('');
    console.log('📚 API Endpoints:');
    console.log('   POST   /api/auth/register');
    console.log('   POST   /api/auth/login');
    console.log('   GET    /api/auth/me');
    console.log('   GET    /api/tables');
    console.log('   POST   /api/tables');
    console.log('   GET    /api/waitlist');
    console.log('   POST   /api/waitlist');
    console.log('   POST   /api/waitlist/:id/notify');
    console.log('   POST   /api/waitlist/:id/seat');
    console.log('');
    console.log('Press CTRL+C to stop');
    console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    // Close server & exit
    httpServer.close(() => process.exit(1));
});

export default app;
