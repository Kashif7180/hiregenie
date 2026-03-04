const Resume = require('../models/Resume');
const { AppError } = require('../middleware/errorHandler');
const { analyzeResume } = require('../services/aiService');

// ==========================================
// @desc    Analyze a resume using Gemini AI
// @route   POST /api/ai/analyze/:resumeId
// @access  Private
//
// FLOW:
// 1. Find the resume in MongoDB
// 2. Check if text was extracted
// 3. Send text to Gemini AI
// 4. Save analysis results back to MongoDB
// 5. Return analysis to frontend
// ==========================================
const analyzeResumeController = async (req, res) => {
    const { resumeId } = req.params;

    // Step 1: Find the resume
    const resume = await Resume.findOne({
        _id: resumeId,
        user: req.user.id, // Ensure user owns this resume
    });

    if (!resume) {
        throw new AppError('Resume not found', 404);
    }

    // Step 2: Check if text exists
    if (!resume.extractedText || resume.extractedText.trim().length < 50) {
        throw new AppError(
            'Resume text could not be extracted. Your PDF may be scanned/image-based. Please upload a text-based PDF (created from Word, Google Docs, etc.).',
            400
        );
    }

    // Step 3: Send to Gemini AI
    const { success, analysis, error } = await analyzeResume(resume.extractedText);

    if (!success) {
        throw new AppError(`AI analysis failed: ${error}`, 500);
    }

    // Step 4: Save results to MongoDB
    resume.analysis = {
        overallScore: analysis.overallScore,
        atsScore: analysis.atsScore,
        summary: analysis.summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        suggestions: analysis.suggestions,
        keywordAnalysis: analysis.keywordAnalysis,
    };
    resume.parsedSkills = [
        ...(analysis.skills?.technical || []),
        ...(analysis.skills?.soft || []),
    ];
    resume.parsedExperience = analysis.experience;
    resume.parsedEducation = analysis.education;
    resume.isAnalyzed = true;
    resume.analyzedAt = new Date();

    await resume.save();

    // Step 5: Return to frontend
    res.status(200).json({
        success: true,
        message: 'Resume analyzed successfully!',
        analysis: {
            overallScore: analysis.overallScore,
            atsScore: analysis.atsScore,
            summary: analysis.summary,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            suggestions: analysis.suggestions,
            skills: analysis.skills,
            experience: analysis.experience,
            education: analysis.education,
            keywordAnalysis: analysis.keywordAnalysis,
        },
    });
};

module.exports = { analyzeResumeController };
