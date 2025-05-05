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
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f5f7fa;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              background-color: #ffffff;
              margin: 40px auto;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            h2 {
              color: #2e86de;
            }
            p {
              color: #333333;
              line-height: 1.6;
            }
            .footer {
              margin-top: 30px;
              font-size: 0.9em;
              color: #888;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Hi ${formData.Name},</h2>
            <p>Your registration was <strong>successful</strong>! 🎉</p>
            <p>Thank you for registering — we’re truly excited to see you at the event!</p>
            <p>If you have any questions before the event, feel free to reply to this email.</p>
            <div class="footer">— Team OSS</div>
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
