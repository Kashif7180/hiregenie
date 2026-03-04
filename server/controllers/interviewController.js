const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const { AppError } = require('../middleware/errorHandler');
const { generateQuestions, evaluateAnswer } = require('../services/interviewService');

// ==========================================
// @desc    Start a new interview session
// @route   POST /api/interview/start
// @access  Private
//
// BODY: { resumeId, targetRole, category, difficulty }
//
// FLOW:
// 1. Find the resume + validate text exists
// 2. Send to Gemini AI to generate questions
// 3. Save interview session with questions to MongoDB
// ==========================================
const startInterview = async (req, res) => {
    const { resumeId, targetRole, category, difficulty } = req.body;

    if (!resumeId || !targetRole) {
        throw new AppError('Resume and target role are required', 400);
    }

    // Find resume and verify ownership
    const resume = await Resume.findOne({
        _id: resumeId,
        user: req.user.id,
    });

    if (!resume) {
        throw new AppError('Resume not found', 404);
    }

    if (!resume.extractedText || resume.extractedText.trim().length < 50) {
        throw new AppError('Resume text not available for question generation', 400);
    }

    // Generate questions using AI
    const { success, questions, error } = await generateQuestions(
        resume.extractedText,
        targetRole,
        category || 'mixed',
        difficulty || 'medium'
    );

    if (!success) {
        throw new AppError(`Failed to generate questions: ${error}`, 500);
    }

    // Create interview session
    const interview = await Interview.create({
        user: req.user.id,
        resume: resumeId,
        title: `${targetRole} Interview`,
        targetRole,
        category: category || 'mixed',
        difficulty: difficulty || 'medium',
        questions: questions.map((q) => ({
            question: q.question,
            category: q.category,
            difficulty: q.difficulty,
        })),
        totalQuestions: questions.length,
    });

    res.status(201).json({
        success: true,
        message: `Interview started with ${questions.length} questions!`,
        interview: {
            id: interview._id,
            title: interview.title,
            targetRole: interview.targetRole,
            totalQuestions: interview.totalQuestions,
            questions: interview.questions.map((q) => ({
                id: q._id,
                question: q.question,
                category: q.category,
                difficulty: q.difficulty,
            })),
        },
    });
};

// ==========================================
// @desc    Submit answer for a question
// @route   POST /api/interview/:interviewId/answer/:questionId
// @access  Private
//
// BODY: { answer }
//
// FLOW:
// 1. Find interview + question
// 2. Send answer to Gemini AI for evaluation
// 3. Save score + feedback to MongoDB
// ==========================================
const submitAnswer = async (req, res) => {
    const { interviewId, questionId } = req.params;
    const { answer } = req.body;

    if (!answer || answer.trim().length < 10) {
        throw new AppError('Please provide a more detailed answer (at least 10 characters)', 400);
    }

    const interview = await Interview.findOne({
        _id: interviewId,
        user: req.user.id,
    });

    if (!interview) {
        throw new AppError('Interview not found', 404);
    }

    if (interview.status === 'completed') {
        throw new AppError('This interview is already completed', 400);
    }

    // Find the specific question
    const question = interview.questions.id(questionId);
    if (!question) {
        throw new AppError('Question not found', 404);
    }

    // Evaluate with AI
    const { success, evaluation, error } = await evaluateAnswer(
        question.question,
        answer,
        interview.targetRole
    );

    if (!success) {
        throw new AppError(`Evaluation failed: ${error}`, 500);
    }

    // Save answer + evaluation
    question.userAnswer = answer;
    question.aiScore = evaluation.score * 10; // Convert 1-10 to 0-100
    question.aiFeedback = evaluation.feedback;
    question.idealAnswer = evaluation.modelAnswer;
    question.answeredAt = new Date();

    // Update answered count
    interview.answeredQuestions = interview.questions.filter(
        (q) => q.userAnswer && q.userAnswer.trim().length > 0
    ).length;

    // Check if all questions answered → complete the interview
    if (interview.answeredQuestions >= interview.totalQuestions) {
        interview.status = 'completed';
        interview.completedAt = new Date();

        // Calculate overall score (average of all answered questions)
        const totalScore = interview.questions.reduce((sum, q) => sum + (q.aiScore || 0), 0);
        interview.overallScore = Math.round(totalScore / interview.totalQuestions);

        // Calculate duration (minutes from start to now)
        interview.duration = Math.round(
            (Date.now() - interview.createdAt.getTime()) / 60000
        );
    }

    await interview.save();

    res.status(200).json({
        success: true,
        message: interview.status === 'completed'
            ? '🎉 Interview completed!'
            : `Answer submitted! (${interview.answeredQuestions}/${interview.totalQuestions})`,
        evaluation: {
            score: evaluation.score,
            feedback: evaluation.feedback,
            modelAnswer: evaluation.modelAnswer,
        },
        progress: {
            answered: interview.answeredQuestions,
            total: interview.totalQuestions,
            status: interview.status,
            overallScore: interview.overallScore,
        },
    });
};

// ==========================================
// @desc    Get all interviews for the user
// @route   GET /api/interview
// @access  Private
// ==========================================
const getInterviews = async (req, res) => {
    const interviews = await Interview.find({ user: req.user.id })
        .select('-questions.userAnswer -questions.aiFeedback -questions.idealAnswer')
        .sort({ createdAt: -1 })
        .populate('resume', 'originalName');

    res.status(200).json({ success: true, interviews });
};

// ==========================================
// @desc    Get a single interview with full details
// @route   GET /api/interview/:id
// @access  Private
// ==========================================
const getInterviewById = async (req, res) => {
    const interview = await Interview.findOne({
        _id: req.params.id,
        user: req.user.id,
    }).populate('resume', 'originalName');

    if (!interview) {
        throw new AppError('Interview not found', 404);
    }

    res.status(200).json({ success: true, interview });
};

module.exports = { startInterview, submitAnswer, getInterviews, getInterviewById };
