import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const { data } = await api.get('/report/dashboard');
                setReport(data.report);
            } catch {
                toast.error('Failed to load reports');
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, []);

    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--color-success)';
        if (score >= 60) return 'var(--color-info)';
        if (score >= 40) return 'var(--color-warning)';
        return 'var(--color-error)';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Average';
        return 'Needs Work';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <div className="reports-page">
                <div className="spinner"></div>
                <p>Loading your reports...</p>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="reports-page">
                <h1>Reports <span className="gradient-text">Dashboard</span></h1>
                <p>Could not load reports. Please try again.</p>
            </div>
        );
    }

    const { resumeStats, interviewStats, recentActivity } = report;

    return (
        <div className="reports-page">
            <div className="reports-header">
                <h1>Reports <span className="gradient-text">Dashboard</span></h1>
                <p className="reports-subtitle">Your complete progress at a glance</p>
            </div>

            {/* ===== STAT CARDS ===== */}
            <div className="stat-cards">
                <div className="stat-card">
                    <div className="stat-icon">📄</div>
                    <div className="stat-value">{resumeStats.total}</div>
                    <div className="stat-label">Resumes Uploaded</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🤖</div>
                    <div className="stat-value">{resumeStats.analyzed}</div>
                    <div className="stat-label">AI Analyzed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🎙️</div>
                    <div className="stat-value">{interviewStats.total}</div>
                    <div className="stat-label">Interviews Taken</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-value">{interviewStats.completed}</div>
                    <div className="stat-label">Completed</div>
                </div>
            </div>

            {/* ===== SCORE OVERVIEW ===== */}
            <div className="score-overview">
                <div className="score-card-lg">
                    <h3>📊 Resume Score</h3>
                    <div className="score-ring" style={{ '--score-color': getScoreColor(resumeStats.avgScore) }}>
                        <span className="score-ring-value">{resumeStats.avgScore}</span>
                        <span className="score-ring-label">/ 100</span>
                    </div>
                    <div className="score-bar-container">
                        <div className="score-bar-bg">
                            <div className="score-bar-fg" style={{ width: `${resumeStats.avgScore}%`, background: getScoreColor(resumeStats.avgScore) }} />
                        </div>
                        <span className="score-badge" style={{ color: getScoreColor(resumeStats.avgScore) }}>
                            {getScoreLabel(resumeStats.avgScore)}
                        </span>
                    </div>
                </div>

                <div className="score-card-lg">
                    <h3>🎯 ATS Score</h3>
                    <div className="score-ring" style={{ '--score-color': getScoreColor(resumeStats.avgAtsScore) }}>
                        <span className="score-ring-value">{resumeStats.avgAtsScore}</span>
                        <span className="score-ring-label">/ 100</span>
                    </div>
                    <div className="score-bar-container">
                        <div className="score-bar-bg">
                            <div className="score-bar-fg" style={{ width: `${resumeStats.avgAtsScore}%`, background: getScoreColor(resumeStats.avgAtsScore) }} />
                        </div>
                        <span className="score-badge" style={{ color: getScoreColor(resumeStats.avgAtsScore) }}>
                            {getScoreLabel(resumeStats.avgAtsScore)}
                        </span>
                    </div>
                </div>

                <div className="score-card-lg">
                    <h3>🎙️ Interview Avg</h3>
                    <div className="score-ring" style={{ '--score-color': getScoreColor(interviewStats.avgScore) }}>
                        <span className="score-ring-value">{interviewStats.avgScore}</span>
                        <span className="score-ring-label">/ 100</span>
                    </div>
                    <div className="score-bar-container">
                        <div className="score-bar-bg">
                            <div className="score-bar-fg" style={{ width: `${interviewStats.avgScore}%`, background: getScoreColor(interviewStats.avgScore) }} />
                        </div>
                        <span className="score-badge" style={{ color: getScoreColor(interviewStats.avgScore) }}>
                            {getScoreLabel(interviewStats.avgScore)}
                        </span>
                    </div>
                </div>
            </div>

            {/* ===== INTERVIEW TREND ===== */}
            {interviewStats.scoreTrend.length > 0 && (
                <div className="report-section">
                    <h2>📈 Interview Score Trend</h2>
                    <div className="trend-chart">
                        {interviewStats.scoreTrend.map((item, i) => (
                            <div key={i} className="trend-bar-wrapper">
                                <div className="trend-score" style={{ color: getScoreColor(item.score) }}>
                                    {item.score}%
                                </div>
                                <div className="trend-bar-track">
                                    <div
                                        className="trend-bar-fill"
                                        style={{
                                            height: `${item.score}%`,
                                            background: `linear-gradient(180deg, ${getScoreColor(item.score)}, transparent)`,
                                        }}
                                    />
                                </div>
                                <div className="trend-label">{item.role.split(' ')[0]}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ===== SKILLS + STRENGTHS/WEAKNESSES ===== */}
            <div className="report-grid-2">
                {/* Skills */}
                <div className="report-section">
                    <h2>🛠️ Skills Detected ({resumeStats.skills.length})</h2>
                    {resumeStats.skills.length > 0 ? (
                        <div className="skills-cloud">
                            {resumeStats.skills.map((skill, i) => (
                                <span key={i} className="skill-chip">{skill}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-text">Upload and analyze a resume to see skills</p>
                    )}
                </div>

                {/* Strengths & Weaknesses */}
                <div className="report-section">
                    <h2>💪 Strengths & ⚠️ Weaknesses</h2>
                    {resumeStats.strengths.length > 0 ? (
                        <div className="sw-list">
                            {resumeStats.strengths.slice(0, 3).map((s, i) => (
                                <div key={i} className="sw-item strength">
                                    <span className="sw-icon">✅</span>
                                    <span>{s}</span>
                                </div>
                            ))}
                            {resumeStats.weaknesses.slice(0, 3).map((w, i) => (
                                <div key={i} className="sw-item weakness">
                                    <span className="sw-icon">❌</span>
                                    <span>{w}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-text">Analyze a resume to see strengths & weaknesses</p>
                    )}
                </div>
            </div>

            {/* ===== RECENT ACTIVITY ===== */}
            <div className="report-section">
                <h2>📋 Recent Activity</h2>
                {recentActivity.length > 0 ? (
                    <div className="activity-timeline">
                        {recentActivity.map((item, i) => (
                            <div key={i} className="activity-item">
                                <div className="activity-dot" />
                                <div className="activity-content">
                                    <span className="activity-icon">{item.icon}</span>
                                    <span className="activity-title">{item.title}</span>
                                    <span className="activity-date">{formatDate(item.date)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-text">No activity yet. Upload a resume to get started!</p>
                )}
            </div>
        </div>
    );
};

export default Reports;
