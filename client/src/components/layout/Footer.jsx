import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
    const location = useLocation();

    // Don't show global footer on landing page (it has its own footer)
    if (location.pathname === '/') return null;

    return (
        <footer className="app-footer">
            <div className="footer-bottom">
                <p>© 2026 HireGenie. All Rights Reserved.</p>
                <p>
                    Built with ❤️ by{' '}
                    <a
                        href="https://linkedin.com/in/syed-mohd-kashif-rizvi-83549"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-dev-link"
                    >
                        Syed Mohd Kashif Rizvi
                    </a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
