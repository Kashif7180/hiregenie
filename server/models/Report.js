const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        interview: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Interview',
        },
        title: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['interview-report', 'resume-analysis', 'career-roadmap'],
            default: 'interview-report',
        },
        fileName: {
            type: String,
            required: true,
        },
        filePath: {
            type: String,
            required: true,
        },
        fileSize: {
            type: Number,
            default: 0,
        },
        generatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Report', reportSchema);
