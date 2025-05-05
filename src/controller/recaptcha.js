const User = require('../model/student');
const email = require('../utility/mailer');
const verify = async (req, res) => {
    const { Token, contactData, formData } = req.body;

    if (!Token) {
        return res.status(400).json({ success: false, message: "Missing reCAPTCHA token" });
    }

    const secretKey = '6LfpsR0rAAAAAN1hzodnmsM1zjMnsojjhRXzqF8W';

    try {
        // Verify reCAPTCHA token
        const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `secret=${secretKey}&response=${Token}`,
        });

        const data = await response.json();

        if (!data.success) {
            return res.status(400).json({ success: false, message: "Invalid reCAPTCHA" });
        }

        console.log("✅ reCAPTCHA verified successfully.");

        // Find or create user
        let existingUser = await User.findOne({ Email: contactData.Email });

        if (!existingUser) {
            console.log("🆕 User not found. Creating new user.");
            existingUser = new User({
                ...formData,
                ...contactData,
            });
        } else {
            console.log("✅ User found. Updating user.");
            Object.assign(existingUser, formData, contactData);
        }

        await existingUser.save();

        const message = `Hi ${formData.Name},\n\nYour registration was successful.\n\nThank you \n\n excited to see you in the event !!`;
        await email(contactData.Email, 'Registration Confirmation', message);

        return res.status(200).json({
            success: true,
            message: "✅ reCAPTCHA verified and user saved",
            user: existingUser,
        });

    } catch (error) {
        console.error("❌ Error:", error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = verify;
