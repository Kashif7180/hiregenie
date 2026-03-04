import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const { register, isLoading, error, clearError, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Show error toast
    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, clearError]);

    // Calculate password strength (0-4)
    const getPasswordStrength = (password) => {
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 10) score++;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return Math.min(score, 4);
    };

    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['', '#ef4444', '#f59e0b', '#06b6d4', '#10b981'];
    const passwordStrength = getPasswordStrength(formData.password);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email';
        }
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) {
            toast.success('Account created successfully! 🎉');
            navigate('/dashboard', { replace: true });
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Header */}
                <div className="auth-header">
                    <div className="auth-logo">🚀</div>
                    <h2>Create Account</h2>
                    <p className="auth-subtitle">Start your AI-powered interview preparation</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    {/* Name */}
                    <div className="form-group">
                        <label htmlFor="register-name" className="form-label">Full Name</label>
                        <div className={`input-wrapper ${formErrors.name ? 'error' : ''}`}>
                            <span className="input-icon">👤</span>
                            <input
                                id="register-name"
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                autoComplete="name"
                            />
                        </div>
                        {formErrors.name && <span className="form-error">{formErrors.name}</span>}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="register-email" className="form-label">Email Address</label>
                        <div className={`input-wrapper ${formErrors.email ? 'error' : ''}`}>
                            <span className="input-icon">📧</span>
                            <input
                                id="register-email"
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

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="register-password" className="form-label">Password</label>
                        <div className={`input-wrapper ${formErrors.password ? 'error' : ''}`}>
                            <span className="input-icon">🔒</span>
                            <input
                                id="register-password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Min. 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                autoComplete="new-password"
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

                        {/* Password Strength Bar */}
                        {formData.password && (
                            <div className="password-strength">
                                <div className="strength-bars">
                                    {[1, 2, 3, 4].map((level) => (
                                        <div
                                            key={level}
                                            className={`strength-bar ${passwordStrength >= level ? 'active' : ''}`}
                                            style={{
                                                backgroundColor: passwordStrength >= level ? strengthColors[passwordStrength] : undefined,
                                            }}
                                        />
                                    ))}
                                </div>
                                <span
                                    className="strength-label"
                                    style={{ color: strengthColors[passwordStrength] }}
                                >
                                    {strengthLabels[passwordStrength]}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="register-confirm" className="form-label">Confirm Password</label>
                        <div className={`input-wrapper ${formErrors.confirmPassword ? 'error' : ''}`}>
                            <span className="input-icon">🔒</span>
                            <input
                                id="register-confirm"
                                type={showPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="Re-enter your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="form-input"
                                autoComplete="new-password"
                            />
                            {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                <span className="input-check">✅</span>
                            )}
                        </div>
                        {formErrors.confirmPassword && (
                            <span className="form-error">{formErrors.confirmPassword}</span>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="btn-spinner"></span>
                                Creating Account...
                            </>
                        ) : (
                            'Create Account →'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-footer-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
