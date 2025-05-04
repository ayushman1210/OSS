const nodemailer = require('nodemailer');

const sendMail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // your Gmail
                pass: process.env.EMAIL_PASS  // your App Password
            }
        });

        await transporter.sendMail({
            from: `"TEAM OSS" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text
        });

        console.log('Email sent successfully!');
    } catch (err) {
        console.error('Error sending email:', err);
    }
};

module.exports = sendMail;
