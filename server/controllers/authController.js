const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const {
    generateAccessToken,
    generateRefreshToken,
    formatUserResponse,
} = require('../utils/helpers');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ==========================================
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ==========================================
const register = async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('User with this email already exists', 400);
    }

    // Create new user (password is hashed automatically by pre-save hook)
    const user = await User.create({ name, email, password });

    // Generate tokens
    const token = generateAccessToken(user._id, user.email);
    const refreshToken = generateRefreshToken(user._id);

    // Send response
    res.status(201).json({
        success: true,
        message: 'Registration successful!',
        token,
        refreshToken,
        user: formatUserResponse(user),
    });
};

// ==========================================
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ==========================================
const login = async (req, res) => {
    const { email, password } = req.body;

    // Find user and include password field (normally excluded by select: false)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }

    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const token = generateAccessToken(user._id, user.email);
    const refreshToken = generateRefreshToken(user._id);

    // Send response
    res.status(200).json({
        success: true,
        message: 'Login successful!',
        token,
        refreshToken,
        user: formatUserResponse(user),
    });
};

// ==========================================
// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private (requires JWT)
// ==========================================
const getMe = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    res.status(200).json({
        success: true,
        user: formatUserResponse(user),
    });
};

// ==========================================
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
// ==========================================
const updateProfile = async (req, res) => {
    const allowedFields = ['name', 'phone', 'bio', 'targetRole', 'experienceLevel', 'skills'];
    const updates = {};

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
    });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully!',
        user: formatUserResponse(user),
    });
};

// ==========================================
// @desc    Refresh access token using refresh token
// @route   POST /api/auth/refresh
// @access  Public
// ==========================================
const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new AppError('Refresh token is required', 400);
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            throw new AppError('User no longer exists', 401);
        }

        const newToken = generateAccessToken(user._id, user.email);

        res.status(200).json({
            success: true,
            token: newToken,
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Invalid or expired refresh token', 401);
    }
};

// ==========================================
// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
// ==========================================
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError('No account found with that email', 404);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    res.status(200).json({
        success: true,
        message: 'Password reset link generated!',
        ...(process.env.NODE_ENV === 'development' && { resetUrl, resetToken }),
    });
};

// ==========================================
// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
// ==========================================
const resetPassword = async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        throw new AppError('Invalid or expired reset token', 400);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const accessToken = generateAccessToken(user._id, user.email);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
        success: true,
        message: 'Password reset successful!',
        token: accessToken,
        refreshToken,
        user: formatUserResponse(user),
    });
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
};
