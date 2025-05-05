const User = require('../model/student'); // Capitalize model name to follow convention

const verify = async (req, res) => {
    const { Token, formData, contactData } = req.body;

    if (!Token) {
        return res.status(400).json({ success: false, message: "Missing reCAPTCHA token" });
    }

    const secretKey = '6LfpsR0rAAAAAN1hzodnmsM1zjMnsojjhRXzqF8W';

    try {
        const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `secret=${secretKey}&response=${Token}`,
        });

        const data = await response.json();
        console.log(data);
        if (!data.success) {
            return res.status(400).json({ success: false, message: "Invalid reCAPTCHA" });
        }

        // Assuming you want to create a new user every time (you can add logic to check for existing users)
        const newUser = new User({
            ...formData,
            ...contactData,
            // payment info can go here if needed
        });

        await newUser.save();

        const message = `Hi ${formData.Name},\n\nYour payment was successful.\n\nThank you for registering!`;
        await email(contactData.Email, 'Payment Confirmation', message);

        console.log("✅ User after save:", newUser);

        return res.status(200).json({
            success: true,
            message: "✅ Payment verified and user saved",
            user: newUser,
        });

    } catch (error) {
        console.error("❌ Error during verification or saving:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};


module.exports=verify;