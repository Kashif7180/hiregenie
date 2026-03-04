import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Please enter your email');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setIsSent(true);
            toast.success('Reset link sent! Check your email.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">🔑</div>
                    <h2>Forgot Password</h2>
                    <p className="auth-subtitle">
                        {isSent
                            ? 'Check your email for reset instructions'
                            : "Enter your email and we'll send you a reset link"}
                    </p>
                </div>

                {!isSent ? (
                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        <div className="form-group">
                            <label htmlFor="forgot-email" className="form-label">Email Address</label>
                            <div className="input-wrapper">
                                <span className="input-icon">📧</span>
                                <input
                                    id="forgot-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="form-input"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    Sending...
                                </>
                            ) : (
                                'Send Reset Link →'
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="auth-success">
                        <div className="success-icon">✉️</div>
                        <p>We&apos;ve sent a password reset link to <strong>{email}</strong></p>
                        <button
                            className="btn btn-outline btn-full"
                            onClick={() => { setIsSent(false); setEmail(''); }}
                            style={{ marginTop: '1rem' }}
                        >
                            Try another email
                        </button>
                    </div>
                )}

                <p className="auth-footer">
                    Remember your password?{' '}
                    <Link to="/login" className="auth-footer-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
