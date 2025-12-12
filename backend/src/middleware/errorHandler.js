/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for dev
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error:', err);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { statusCode: 404, message };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        error = { statusCode: 400, message };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors)
            .map((e) => e.message)
            .join(', ');
        error = { statusCode: 400, message };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = { statusCode: 401, message: 'Invalid token' };
    }

    if (err.name === 'TokenExpiredError') {
        error = { statusCode: 401, message: 'Token expired' };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

/**
 * Not found handler
 */
export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
