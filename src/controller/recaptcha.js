const User = require('../model/student');
const email = require('../utility/mailer');
const fetch = require('node-fetch');
const https = require('https');

// keep-alive agent (reduces HTTPS handshake time)
const agent = new https.Agent({ keepAlive: true });

const verify = async (req, res) => {
  const { Token, contactData, formData } = req.body;
  if (!Token) {
    return res.status(400).json({ success: false, message: "Missing reCAPTCHA token" });
  }

  const secretKey = process.env.RECAPTCHA_SECRET || '6LfpsR0rAAAAAN1hzodnmsM1zjMnsojjhRXzqF8W';

  try {
    // 🔹 Verify reCAPTCHA (non-blocking)
    const verifyPromise = fetch("https://www.google.com/recaptcha/api/siteverify", {
      agent,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: Token,
      }),
    }).then(res => res.json());

    // 🔹 Check user existence (can run in parallel)
    const userPromise = User.findOne({ Email: contactData.Email });

    const [captchaData, existingUser] = await Promise.all([verifyPromise, userPromise]);

    if (!captchaData.success) {
      return res.status(400).json({ success: false, message: "Invalid reCAPTCHA" });
    }

    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // 🔹 Create and save new user
    const newUser = new User({
      ...formData,
      ...contactData,
    });
    await newUser.save();

    // 🔹 Send email in background (no need to wait)
    (async () => {
      try {
        const message = `<!DOCTYPE html> 
          ... your email html here ...`;
        await email(contactData.Email, 'Registration Confirmation', message);
      } catch (e) {
        console.error('❌ Email sending failed:', e.message);
      }
    })();

    // ✅ Respond immediately
    return res.status(200).json({
      success: true,
      message: "✅ reCAPTCHA verified and user saved",
      user: newUser,
    });

  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = verify;
