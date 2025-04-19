const verify = async (req, res) => {
    const { Token } = req.body;
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
        console.log(data); // Optional: helpful for debugging

        if (!data.success) {
            return res.status(400).json({ success: false, message: "Invalid reCAPTCHA" });
        }

        res.status(200).json({ success: true, message: "Verified successfully" });
    } catch (error) {
        console.error("error in verification", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = verify;
