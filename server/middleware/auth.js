const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

// Protect routes - Verify JWT token
const protect = (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Also check cookies
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        throw new AppError('Not authorized. No token provided.', 401);
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, email: decoded.email };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new AppError('Token expired. Please login again.', 401);
        }
        throw new AppError('Not authorized. Invalid token.', 401);
    }
};

module.exports = { protect };
