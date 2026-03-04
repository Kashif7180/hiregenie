import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="landing-page">
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">🧞‍♂️ Powered by Google Gemini AI</div>
                    <h1 className="hero-title">
                        Ace Your Next
                        <span className="gradient-text"> Job Interview</span>
                        <br />with AI
                    </h1>
                    <p className="hero-subtitle">
                        Upload your resume, practice with AI-powered mock interviews,
                        get instant feedback, and land your dream job.
                    </p>
                    <div className="hero-cta">
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Get Started Free →
                        </Link>
                        <Link to="/login" className="btn btn-outline btn-lg">
                            Sign In
                        </Link>
                    </div>
                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-number">10K+</span>
                            <span className="stat-label">Interviews Practiced</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">95%</span>
                            <span className="stat-label">Success Rate</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">500+</span>
                            <span className="stat-label">Companies</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="features" id="features">
                <h2 className="section-title">Everything You Need to <span className="gradient-text">Prepare</span></h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📄</div>
                        <h3>AI Resume Analysis</h3>
                        <p>Get instant ATS scoring, skill extraction, and improvement suggestions powered by Gemini AI.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎯</div>
                        <h3>Smart Interview Prep</h3>
                        <p>AI generates role-specific interview questions tailored to your resume and target position.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💬</div>
                        <h3>Mock Interviews</h3>
                        <p>Practice with interactive AI mock interviews and receive real-time feedback on your answers.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Performance Analytics</h3>
                        <p>Track your progress with detailed analytics, score trends, and skill assessments over time.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📝</div>
                        <h3>Cover Letter Generator</h3>
                        <p>Generate tailored cover letters matched to specific job descriptions in seconds.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📑</div>
                        <h3>PDF Reports</h3>
                        <p>Download professional PDF reports with scores, feedback, and improvement roadmaps.</p>
                    </div>
                </div>
            </section>

            {/* About Developer Section */}
            <section className="about-dev" id="about">
                <h2 className="section-title">About the <span className="gradient-text">Developer</span></h2>
                <div className="dev-card">
                    <div className="dev-avatar">SK</div>
                    <div className="dev-info">
                        <h3>Syed Mohd Kashif Rizvi</h3>
                        <p className="dev-role">Full Stack Developer | MERN Stack Specialist</p>
                        <p className="dev-bio">
                            A passionate software engineer with expertise in building scalable web applications
                            using React, Node.js, MongoDB, and cloud technologies. Skilled in integrating
                            AI/ML services like Google Gemini to create intelligent, user-centric solutions.
                            Dedicated to crafting clean code and delivering premium digital experiences.
                        </p>
                        <div className="dev-tech">
                            <span className="dev-chip">React.js</span>
                            <span className="dev-chip">Node.js</span>
                            <span className="dev-chip">MongoDB</span>
                            <span className="dev-chip">Express</span>
                            <span className="dev-chip">Gemini AI</span>
                            <span className="dev-chip">DSA</span>
                            <span className="dev-chip">Problem Solving</span>
                        </div>
                        <div className="dev-links">
                            <a
                                href="https://linkedin.com/in/syed-mohd-kashif-rizvi-83549"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary btn-sm"
                            >
                                🔗 Connect on LinkedIn
                            </a>
                            <a
                                href="https://github.com/Kashif7180"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline btn-sm"
                            >
                                💻 GitHub Profile
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <span className="footer-logo">🧞‍♂️ Hire<span className="gradient-text">Genie</span></span>
                        <p>AI-powered interview preparation platform</p>
                    </div>
                    <div className="footer-links">
                        <Link to="/register">Get Started</Link>
                        <Link to="/login">Sign In</Link>
                        <a href="#features">Features</a>
                        <a href="#about">About Developer</a>
                    </div>
                    <div className="footer-social">
                        <a href="https://linkedin.com/in/syed-mohd-kashif-rizvi-83549" target="_blank" rel="noopener noreferrer">
                            LinkedIn
                        </a>
                        <a href="https://github.com/Kashif7180" target="_blank" rel="noopener noreferrer">
                            GitHub
                        </a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026 HireGenie. All Rights Reserved.</p>
                    <p>Built with ❤️ by <strong>Syed Mohd Kashif Rizvi</strong></p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
