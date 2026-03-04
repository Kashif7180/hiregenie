import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/report/dashboard');
                setStats(data.report);
            } catch {
                // silently fail — show 0s
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Welcome back, <span className="gradient-text">{user?.name || 'User'}</span>! 👋</h1>
                <p className="dashboard-subtitle">Here&apos;s your interview preparation overview</p>
            </div>

            <div className="dashboard-stats-grid">
                <div className="stat-card">
                    <div className="stat-card-icon">📄</div>
                    <div className="stat-card-info">
                        <h3>{stats?.resumeStats?.total || 0}</h3>
                        <p>Resumes Uploaded</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon">💬</div>
                    <div className="stat-card-info">
                        <h3>{stats?.interviewStats?.total || 0}</h3>
                        <p>Mock Interviews</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon">📊</div>
                    <div className="stat-card-info">
                        <h3>{stats?.interviewStats?.avgScore || 0}%</h3>
                        <p>Average Score</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon">📑</div>
                    <div className="stat-card-info">
                        <h3>{stats?.resumeStats?.analyzed || 0}</h3>
                        <p>AI Analyzed</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-actions">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                    <a href="/resume" className="action-card">
                        <span className="action-icon">📄</span>
                        <span className="action-title">Upload Resume</span>
                        <span className="action-desc">Analyze your resume with AI</span>
                    </a>
                    <a href="/interview" className="action-card">
                        <span className="action-icon">🎯</span>
                        <span className="action-title">Start Interview</span>
                        <span className="action-desc">Practice with AI questions</span>
                    </a>
                    <a href="/reports" className="action-card">
                        <span className="action-icon">📑</span>
                        <span className="action-title">View Reports</span>
                        <span className="action-desc">See your full analytics</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
