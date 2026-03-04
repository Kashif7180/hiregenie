import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const JOB_ROLES = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'React Developer', 'Node.js Developer', 'MERN Stack Developer',
    'Software Engineer', 'DevOps Engineer', 'Data Scientist',
    'Mobile App Developer', 'Python Developer', 'Java Developer',
];

const CATEGORIES = [
    { value: 'mixed', label: '🎯 Mixed (Recommended)' },
    { value: 'technical', label: '💻 Technical' },
    { value: 'behavioral', label: '🧠 Behavioral' },
    { value: 'hr', label: '👔 HR Round' },
];

const Interview = () => {
    // ---- State ----
    const [resumes, setResumes] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Setup form
    const [selectedResume, setSelectedResume] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [category, setCategory] = useState('mixed');

    // Active interview
    const [activeInterview, setActiveInterview] = useState(null);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [lastEvaluation, setLastEvaluation] = useState(null);

    // View mode
    const [view, setView] = useState('setup'); // 'setup', 'active', 'review'

    // ---- Load resumes and past interviews ----
    const fetchData = useCallback(async () => {
        try {
            const [resumeRes, interviewRes] = await Promise.all([
                api.get('/resume'),
                api.get('/interview'),
            ]);
            setResumes(resumeRes.data.resumes);
            setInterviews(interviewRes.data.interviews);
        } catch {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ---- Start Interview ----
    const handleStart = async () => {
        if (!selectedResume || !targetRole) {
            toast.error('Please select a resume and enter a job role');
            return;
        }

        setIsStarting(true);
        const loadingToast = toast.loading('🤖 AI is preparing your interview...');

        try {
            const { data } = await api.post('/interview/start', {
                resumeId: selectedResume,
                targetRole,
                category,
            });
            toast.dismiss(loadingToast);
            toast.success(data.message);

            // Load full interview details
            const { data: fullData } = await api.get(`/interview/${data.interview.id}`);
            setActiveInterview(fullData.interview);
            setCurrentQIndex(0);
            setUserAnswer('');
            setLastEvaluation(null);
            setView('active');
            fetchData();
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || 'Failed to start interview');
        } finally {
            setIsStarting(false);
        }
    };

    // ---- Submit Answer ----
    const handleSubmitAnswer = async () => {
        if (!userAnswer.trim() || userAnswer.trim().length < 10) {
            toast.error('Please write a more detailed answer (at least 10 characters)');
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading('🤖 AI is evaluating your answer...');

        try {
            const question = activeInterview.questions[currentQIndex];
            const { data } = await api.post(
                `/interview/${activeInterview._id}/answer/${question._id}`,
                { answer: userAnswer }
            );
            toast.dismiss(loadingToast);
            toast.success(data.message);

            setLastEvaluation(data.evaluation);

            // Update active interview's question with answer data
            const updated = { ...activeInterview };
            updated.questions[currentQIndex] = {
                ...updated.questions[currentQIndex],
                userAnswer: userAnswer,
                aiScore: data.evaluation.score * 10,
                aiFeedback: data.evaluation.feedback,
                idealAnswer: data.evaluation.modelAnswer,
                answeredAt: new Date(),
            };
            updated.answeredQuestions = data.progress.answered;
            updated.status = data.progress.status;
            updated.overallScore = data.progress.overallScore;
            setActiveInterview(updated);

            fetchData();
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || 'Failed to submit answer');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ---- Navigate Questions ----
    const goToNext = () => {
        setLastEvaluation(null);
        setUserAnswer('');
        if (currentQIndex < activeInterview.questions.length - 1) {
            setCurrentQIndex(currentQIndex + 1);
        }
    };

    // ---- View Past Interview ----
    const viewInterview = async (id) => {
        try {
            const { data } = await api.get(`/interview/${id}`);
            setActiveInterview(data.interview);
            setCurrentQIndex(0);
            setView('review');
        } catch {
            toast.error('Failed to load interview');
        }
    };

    // ---- Score Color ----
    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--color-success)';
        if (score >= 60) return 'var(--color-info)';
        if (score >= 40) return 'var(--color-warning)';
        return 'var(--color-error)';
    };

    const getDifficultyColor = (d) => {
        if (d === 'easy') return 'var(--color-success)';
        if (d === 'medium') return 'var(--color-warning)';
        return 'var(--color-error)';
    };

    if (isLoading) {
        return <div className="interview-page"><div className="spinner"></div><p>Loading...</p></div>;
    }

    return (
        <div className="interview-page">
            <div className="interview-header">
                <h1>Interview <span className="gradient-text">Prep</span></h1>
                <p className="interview-subtitle">
                    Practice with AI-generated questions tailored to your resume
                </p>
                {view !== 'setup' && (
                    <button className="btn btn-outline btn-sm" onClick={() => { setView('setup'); setActiveInterview(null); setLastEvaluation(null); }}>
                        ← Back to Setup
                    </button>
                )}
            </div>

            {/* ===== SETUP VIEW ===== */}
            {view === 'setup' && (
                <>
                    <div className="interview-setup">
                        <h2>🎯 Start New Interview</h2>

                        <div className="setup-form">
                            <div className="form-group">
                                <label>📄 Select Resume</label>
                                <select value={selectedResume} onChange={(e) => setSelectedResume(e.target.value)}>
                                    <option value="">Choose a resume...</option>
                                    {resumes.filter(r => r.isAnalyzed || r.extractedText).map((r) => (
                                        <option key={r._id} value={r._id}>{r.originalName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>💼 Target Job Role</label>
                                <input
                                    type="text"
                                    list="roles"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    placeholder="e.g., Full Stack Developer"
                                />
                                <datalist id="roles">
                                    {JOB_ROLES.map((role) => <option key={role} value={role} />)}
                                </datalist>
                            </div>

                            <div className="form-group">
                                <label>📋 Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                    {CATEGORIES.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                className="btn btn-primary btn-full"
                                onClick={handleStart}
                                disabled={isStarting || !selectedResume || !targetRole}
                            >
                                {isStarting ? '⏳ Generating Questions...' : '🚀 Start Interview'}
                            </button>
                        </div>
                    </div>

                    {/* Past Interviews */}
                    <div className="interview-history">
                        <h2>📜 Past Interviews ({interviews.length})</h2>
                        {interviews.length === 0 ? (
                            <p className="empty-text">No interviews yet. Start your first one above!</p>
                        ) : (
                            <div className="interview-list">
                                {interviews.map((iv) => (
                                    <div key={iv._id} className="interview-card" onClick={() => viewInterview(iv._id)}>
                                        <div className="interview-card-info">
                                            <h4>{iv.title}</h4>
                                            <div className="interview-card-meta">
                                                <span>📄 {iv.resume?.originalName || 'Resume'}</span>
                                                <span>•</span>
                                                <span>{iv.answeredQuestions}/{iv.totalQuestions} answered</span>
                                                <span>•</span>
                                                <span className={`status-badge ${iv.status}`}>
                                                    {iv.status === 'completed' ? '✅ Completed' : '⏳ In Progress'}
                                                </span>
                                            </div>
                                        </div>
                                        {iv.status === 'completed' && (
                                            <div className="interview-card-score" style={{ color: getScoreColor(iv.overallScore) }}>
                                                {iv.overallScore}%
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ===== ACTIVE INTERVIEW ===== */}
            {view === 'active' && activeInterview && (
                <div className="interview-active">
                    {/* Progress Bar */}
                    <div className="interview-progress">
                        <div className="progress-info">
                            <span>Question {currentQIndex + 1} of {activeInterview.totalQuestions}</span>
                            <span>{activeInterview.answeredQuestions}/{activeInterview.totalQuestions} answered</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-bar-fill" style={{ width: `${(activeInterview.answeredQuestions / activeInterview.totalQuestions) * 100}%` }} />
                        </div>
                    </div>

                    {/* Question Card */}
                    {(() => {
                        const q = activeInterview.questions[currentQIndex];
                        const isAnswered = q.userAnswer && q.userAnswer.trim().length > 0;

                        return (
                            <div className="question-card">
                                <div className="question-badges">
                                    <span className="badge" style={{ background: getDifficultyColor(q.difficulty), color: '#fff' }}>
                                        {q.difficulty}
                                    </span>
                                    <span className="badge">{q.category}</span>
                                </div>

                                <h3 className="question-text">{q.question}</h3>

                                {/* Answer Area */}
                                {!isAnswered && activeInterview.status !== 'completed' ? (
                                    <div className="answer-area">
                                        <textarea
                                            value={userAnswer}
                                            onChange={(e) => setUserAnswer(e.target.value)}
                                            placeholder="Type your answer here... Be specific and use examples where possible."
                                            rows={6}
                                            disabled={isSubmitting}
                                        />
                                        <div className="answer-actions">
                                            <span className="char-count">{userAnswer.length} chars</span>
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleSubmitAnswer}
                                                disabled={isSubmitting || userAnswer.trim().length < 10}
                                            >
                                                {isSubmitting ? '⏳ Evaluating...' : '📤 Submit Answer'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="answered-view">
                                        <div className="your-answer">
                                            <h4>Your Answer:</h4>
                                            <p>{q.userAnswer}</p>
                                        </div>
                                    </div>
                                )}

                                {/* AI Evaluation */}
                                {(lastEvaluation && !isAnswered === false) || (isAnswered && q.aiFeedback) ? (
                                    <div className="evaluation-card">
                                        <div className="eval-score" style={{ color: getScoreColor((q.aiScore || (lastEvaluation?.score * 10))) }}>
                                            <span className="eval-score-value">{q.aiScore || (lastEvaluation?.score * 10)}</span>
                                            <span className="eval-score-label">/100</span>
                                        </div>
                                        <div className="eval-details">
                                            <div className="eval-feedback">
                                                <h4>💬 AI Feedback</h4>
                                                <p>{q.aiFeedback || lastEvaluation?.feedback}</p>
                                            </div>
                                            <div className="eval-model">
                                                <h4>✨ Model Answer</h4>
                                                <p>{q.idealAnswer || lastEvaluation?.modelAnswer}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        );
                    })()}

                    {/* Navigation */}
                    <div className="question-nav">
                        <button className="btn btn-outline" onClick={() => { setCurrentQIndex(Math.max(0, currentQIndex - 1)); setLastEvaluation(null); setUserAnswer(''); }} disabled={currentQIndex === 0}>
                            ← Previous
                        </button>

                        <div className="question-dots">
                            {activeInterview.questions.map((q, i) => (
                                <button
                                    key={i}
                                    className={`dot ${i === currentQIndex ? 'active' : ''} ${q.userAnswer ? 'answered' : ''}`}
                                    onClick={() => { setCurrentQIndex(i); setLastEvaluation(null); setUserAnswer(''); }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        {currentQIndex < activeInterview.questions.length - 1 ? (
                            <button className="btn btn-primary" onClick={goToNext}>
                                Next →
                            </button>
                        ) : activeInterview.status === 'completed' ? (
                            <button className="btn btn-primary" onClick={() => setView('review')}>
                                📊 View Results
                            </button>
                        ) : (
                            <span className="nav-hint">Answer all questions to complete</span>
                        )}
                    </div>
                </div>
            )}

            {/* ===== REVIEW VIEW ===== */}
            {view === 'review' && activeInterview && (
                <div className="interview-review">
                    <div className="review-header">
                        <h2>{activeInterview.title}</h2>
                        <div className="review-score" style={{ color: getScoreColor(activeInterview.overallScore) }}>
                            {activeInterview.overallScore}%
                        </div>
                    </div>

                    <div className="review-meta">
                        <span>📄 {activeInterview.resume?.originalName}</span>
                        <span>•</span>
                        <span>💼 {activeInterview.targetRole}</span>
                        <span>•</span>
                        <span>📝 {activeInterview.answeredQuestions}/{activeInterview.totalQuestions} answered</span>
                        {activeInterview.duration > 0 && (
                            <><span>•</span><span>⏱️ {activeInterview.duration} min</span></>
                        )}
                    </div>

                    <div className="review-questions">
                        {activeInterview.questions.map((q, i) => (
                            <div key={i} className="review-question-card">
                                <div className="review-q-header">
                                    <span className="review-q-num">Q{i + 1}</span>
                                    <span className="badge" style={{ background: getDifficultyColor(q.difficulty), color: '#fff' }}>
                                        {q.difficulty}
                                    </span>
                                    {q.aiScore > 0 && (
                                        <span className="review-q-score" style={{ color: getScoreColor(q.aiScore) }}>
                                            {q.aiScore}/100
                                        </span>
                                    )}
                                </div>
                                <h4>{q.question}</h4>
                                {q.userAnswer && (
                                    <>
                                        <div className="review-answer">
                                            <strong>Your Answer:</strong>
                                            <p>{q.userAnswer}</p>
                                        </div>
                                        {q.aiFeedback && (
                                            <div className="review-feedback">
                                                <strong>AI Feedback:</strong>
                                                <p>{q.aiFeedback}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Interview;
