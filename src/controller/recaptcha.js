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
       res.status(400).json({
        success:false,
        message:" email duplicate"
       })
        }

        await existingUser.save();

        const message = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Details</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: #fff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 0 auto;
        }
        h1 {
            color: #007BFF;
            text-align: center;
        }
        .event-details {
            margin-bottom: 20px;
        }
        .event-details p {
            font-size: 16px;
            line-height: 1.6;
        }
        .highlight {
            font-weight: bold;
            color: #333;
        }
        .contact {
            font-size: 14px;
        }
        .social-link {
            color: #007BFF;
            text-decoration: none;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 14px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello ${formData.Name},</h1>
        <p class="event-details">You have successfully registered for the event!</p>
        <p class="event-details">Thank you for registering— we’re thrilled to have you join us and can’t wait to see you at the event!</p>
        
        <div class="event-details">
            <p><span class="highlight">📍 Venue:</span> CSIT Auditorium</p>
            <p><span class="highlight">🗓️ Dates:</span> 8th & 9th May, 2025</p>
            <p><span class="highlight">🕓 Time:</span> 4:00 PM – 7:00 PM</p>
            <p><span class="highlight">🎟️ Entry Fee:</span> Absolutely FREE!!</p>
        </div>
        
        <p class="event-details">Follow us on Instagram for updates: <a href="https://www.instagram.com/team__oss/?hl=en" class="social-link">Instagram</a></p>
        
        <div class="contact">
            <p><span class="highlight">📞 For Queries, Contact:</span></p>
            <p>Bhavesh Gautam — (8529715481)</p>
            <p>Anshul Kotwal — (9651411146)</p>
        </div>
        
        <div class="footer">
            <p>Warm Regards,</p>
            <p>✨ Team OSS</p>
        </div>
    </div>
</body>
</html>`;
        
       
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
