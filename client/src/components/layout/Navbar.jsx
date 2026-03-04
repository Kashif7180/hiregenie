import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">🧞‍♂️</span>
                    <span className="logo-text">Hire<span className="gradient-text">Genie</span></span>
                </Link>

                <button
                    className="navbar-toggle"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle navigation"
                >
                    <span className={`hamburger ${mobileOpen ? 'active' : ''}`}></span>
                </button>

                <div className={`navbar-menu ${mobileOpen ? 'open' : ''}`}>
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/dashboard"
                                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/resume"
                                className={`nav-link ${isActive('/resume') ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                Resume
                            </Link>
                            <Link
                                to="/interview"
                                className={`nav-link ${isActive('/interview') ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                Interview
                            </Link>
                            <Link
                                to="/reports"
                                className={`nav-link ${isActive('/reports') ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                Reports
                            </Link>
                            <div className="nav-right">
                                <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                                    {theme === 'dark' ? '☀️' : '🌙'}
                                </button>
                                <div className="user-menu">
                                    <span className="user-avatar">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                    <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <a href="#features" className="nav-link" onClick={() => setMobileOpen(false)}>
                                Features
                            </a>
                            <div className="nav-right">
                                <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                                    {theme === 'dark' ? '☀️' : '🌙'}
                                </button>
                                <Link
                                    to="/login"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
