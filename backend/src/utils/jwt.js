import jwt from 'jsonwebtoken';

/**
 * Generate JWT token
 */
export const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

/**
 * Generate token response
 */
export const generateTokenResponse = (user) => {
    const token = generateToken(user._id, user.role);

    return {
        token,
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        },
    };
};
