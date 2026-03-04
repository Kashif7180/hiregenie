const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        fileName: {
            type: String,
            required: true,
        },
        originalName: {
            type: String,
            required: true,
        },
        filePath: {
            type: String,
            required: true,
        },
        fileSize: {
            type: Number,
            required: true,
        },
        mimeType: {
            type: String,
            required: true,
        },
        extractedText: {
            type: String,
            default: '',
        },
        analysis: {
            overallScore: { type: Number, default: 0 },
            atsScore: { type: Number, default: 0 },
            summary: { type: String, default: '' },
            strengths: [String],
            weaknesses: [String],
            suggestions: [String],
            keywordAnalysis: {
                presentKeywords: [String],
                missingKeywords: [String],
            },
        },
        parsedSkills: [String],
        parsedExperience: {
            totalYears: { type: Number, default: 0 },
            level: { type: String, default: '' },
        },
        parsedEducation: {
            degree: { type: String, default: '' },
            field: { type: String, default: '' },
            institution: { type: String, default: '' },
        },
        isAnalyzed: {
            type: Boolean,
            default: false,
        },
        analyzedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Resume', resumeSchema);
