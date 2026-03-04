const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    category: { type: String, default: 'general' }, // technical, behavioral, situational
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    userAnswer: { type: String, default: '' },
    aiScore: { type: Number, default: 0 }, // 0-100
    aiFeedback: { type: String, default: '' },
    idealAnswer: { type: String, default: '' },
    answeredAt: { type: Date },
});

const interviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        resume: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resume',
        },
        title: {
            type: String,
            required: true,
        },
        targetRole: {
            type: String,
            required: true,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
        category: {
            type: String,
            enum: ['technical', 'behavioral', 'mixed', 'system-design', 'hr'],
            default: 'mixed',
        },
        questions: [questionSchema],
        totalQuestions: {
            type: Number,
            default: 0,
        },
        answeredQuestions: {
            type: Number,
            default: 0,
        },
        overallScore: {
            type: Number,
            default: 0,
        },
        overallFeedback: {
            type: String,
            default: '',
        },
        strengths: [String],
        weaknesses: [String],
        status: {
            type: String,
            enum: ['in-progress', 'completed', 'abandoned'],
            default: 'in-progress',
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: {
            type: Date,
        },
        duration: {
            type: Number, // in minutes
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Interview', interviewSchema);
