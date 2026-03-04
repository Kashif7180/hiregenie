import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Where to redirect after login (default: dashboard)
    const from = location.state?.from?.pathname || '/dashboard';

    // If already logged in, redirect
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    // Show error toast if auth error occurs
    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, clearError]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear field error when user types
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    // Basic client-side validation
    const validateForm = () => {
        const errors = {};
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email';
        }
        if (!formData.password) {
            errors.password = 'Password is required';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const result = await login(formData.email, formData.password);
        if (result.success) {
            toast.success('Welcome back! 🎉');
            navigate(from, { replace: true });
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Header */}
                <div className="auth-header">
                    <div className="auth-logo">🚀</div>
                    <h2>Welcome Back</h2>
                    <p className="auth-subtitle">Sign in to continue your interview prep</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    {/* Email Field */}
                    <div className="form-group">
                        <label htmlFor="login-email" className="form-label">Email Address</label>
                        <div className={`input-wrapper ${formErrors.email ? 'error' : ''}`}>
                            <span className="input-icon">📧</span>
                            <input
                                id="login-email"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                autoComplete="email"
                            />
                        </div>
                        {formErrors.email && <span className="form-error">{formErrors.email}</span>}
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <div className="form-label-row">
                            <label htmlFor="login-password" className="form-label">Password</label>
                            <Link to="/forgot-password" className="form-link">Forgot password?</Link>
                        </div>
                        <div className={`input-wrapper ${formErrors.password ? 'error' : ''}`}>
                            <span className="input-icon">🔒</span>
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {formErrors.password && <span className="form-error">{formErrors.password}</span>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="btn-spinner"></span>
                                Signing in...
                            </>
                        ) : (
                            'Sign In →'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="auth-footer">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="auth-footer-link">Create one</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
