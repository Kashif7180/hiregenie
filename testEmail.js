require('dotenv').config({ path: './server/.env' });
const sendEmail = require('./server/utils/sendEmail');

(async () => {
    try {
        await sendEmail({
            email: 'kashif.cricfan@gmail.com', // Sending to the same email to test
            subject: 'Test Email - SendEmail Script',
            html: '<p>This is a test email sent directly from a Node.js script.</p>'
        });
        console.log('✅ Email sent successfully!');
    } catch (error) {
        console.error('❌ Failed to send email:', error);
    }
})();
