const Resume = require('../models/Resume');
const Interview = require('../models/Interview');
const { AppError } = require('../middleware/errorHandler');

// ==========================================
// @desc    Get dashboard report with aggregated data
// @route   GET /api/reports/dashboard
// @access  Private
//
// Aggregates all user data into one clean response:
// - Resume stats (total, analyzed, avg scores)
// - Interview stats (total, completed, avg score)
// - Recent activity timeline
// - Skill summary across all resumes
// ==========================================
const getDashboardReport = async (req, res) => {
    const userId = req.user.id;

    // Fetch all data in parallel for speed
    const [resumes, interviews] = await Promise.all([
        Resume.find({ user: userId }),
        Interview.find({ user: userId }).sort({ createdAt: -1 }),
    ]);

    // ---- Resume Stats ----
    const analyzedResumes = resumes.filter((r) => r.isAnalyzed);
    const avgResumeScore = analyzedResumes.length > 0
        ? Math.round(analyzedResumes.reduce((sum, r) => sum + (r.analysis?.overallScore || 0), 0) / analyzedResumes.length)
        : 0;
    const avgAtsScore = analyzedResumes.length > 0
        ? Math.round(analyzedResumes.reduce((sum, r) => sum + (r.analysis?.atsScore || 0), 0) / analyzedResumes.length)
        : 0;

    // Collect all skills across resumes
    const allSkills = [];
    analyzedResumes.forEach((r) => {
        if (r.parsedSkills) allSkills.push(...r.parsedSkills);
    });
    const uniqueSkills = [...new Set(allSkills)];

    // Collect strengths and weaknesses
    const allStrengths = [];
    const allWeaknesses = [];
    analyzedResumes.forEach((r) => {
        if (r.analysis?.strengths) allStrengths.push(...r.analysis.strengths);
        if (r.analysis?.weaknesses) allWeaknesses.push(...r.analysis.weaknesses);
    });

    // ---- Interview Stats ----
    const completedInterviews = interviews.filter((i) => i.status === 'completed');
    const avgInterviewScore = completedInterviews.length > 0
        ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / completedInterviews.length)
        : 0;

    // Interview score trend (last 5 completed)
    const scoreTrend = completedInterviews.slice(0, 5).map((i) => ({
        title: i.title,
        score: i.overallScore,
        date: i.completedAt || i.createdAt,
        role: i.targetRole,
    }));

    // ---- Recent Activity ----
    const recentActivity = [];

    resumes.forEach((r) => {
        recentActivity.push({
            type: 'resume_upload',
            title: `Uploaded ${r.originalName}`,
            date: r.createdAt,
            icon: '📄',
        });
        if (r.isAnalyzed && r.analyzedAt) {
            recentActivity.push({
                type: 'resume_analyzed',
                title: `Analyzed ${r.originalName} — Score: ${r.analysis?.overallScore || 0}%`,
                date: r.analyzedAt,
                icon: '🤖',
            });
        }
    });

    interviews.forEach((i) => {
        recentActivity.push({
            type: 'interview_started',
            title: `Started ${i.title}`,
            date: i.createdAt,
            icon: '🎙️',
        });
        if (i.status === 'completed') {
            recentActivity.push({
                type: 'interview_completed',
                title: `Completed ${i.title} — Score: ${i.overallScore}%`,
                date: i.completedAt || i.updatedAt,
                icon: '✅',
            });
        }
    });

    // Sort by date (newest first) and limit to 10
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
        success: true,
        report: {
            resumeStats: {
                total: resumes.length,
                analyzed: analyzedResumes.length,
                avgScore: avgResumeScore,
                avgAtsScore: avgAtsScore,
                skills: uniqueSkills,
                strengths: allStrengths.slice(0, 5),
                weaknesses: allWeaknesses.slice(0, 5),
            },
            interviewStats: {
                total: interviews.length,
                completed: completedInterviews.length,
                inProgress: interviews.filter((i) => i.status === 'in-progress').length,
                avgScore: avgInterviewScore,
                scoreTrend,
            },
            recentActivity: recentActivity.slice(0, 10),
        },
    });
};

module.exports = { getDashboardReport };
