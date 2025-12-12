import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';

/**
 * Protect routes - require authentication
 */
export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please log in.',
            });
        }

        try {
            // Verify token
            const decoded = verifyToken(token);

            // Get user from token
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User no longer exists',
                });
            }

            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'User account is deactivated',
                });
            }

            // Attach user to request
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication',
        });
    }
};

/**
 * Authorize specific roles
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`,
            });
        }

        next();
    };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = verifyToken(token);
                const user = await User.findById(decoded.id).select('-password');

                if (user && user.isActive) {
                    req.user = user;
                }
            } catch (error) {
                // Invalid token, but continue without user
            }
        }

        next();
    } catch (error) {
        next();
    }
};
