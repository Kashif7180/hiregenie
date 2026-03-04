const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT access token
const generateAccessToken = (userId, email) => {
    return jwt.sign({ id: userId, email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// Generate JWT refresh token
const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
    });
};

// Generate random token for password reset
const generateResetToken = () => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    return { resetToken, hashedToken };
};

// Format user response (remove sensitive data)
const formatUserResponse = (user) => {
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    delete userObj.resetPasswordToken;
    delete userObj.resetPasswordExpire;
    delete userObj.__v;
    return userObj;
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateResetToken,
    formatUserResponse,
};
