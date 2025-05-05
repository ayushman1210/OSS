const User = require('../model/student');


const verify = async (req, res) => {
    const { Token } = req.body;
    const {contactData,formData}=req.body;

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

        // Save user
        await existingUser.save();

        // Send confirmation email
        const message = `Hi ${formData.Name},\n\nYour registration was successful.\n\nThank you for signing up!`;
        await email(contactData.Email, 'Registration Confirmation', message);

        // Send response
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
