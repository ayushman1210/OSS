const Student = require('../model/student');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const register = async (req, res) => {
  try {
    const { Token, transactionId, contact, email } = req.body;

    // ===============================
    // 🔒 1. Validate Required Fields
    // ===============================
    if (!Token || !transactionId || !contact) {
      await delay(1500);
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // ===============================
    // 🔐 2. Verify reCAPTCHA (Backend)
    // ===============================
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `secret=${process.env.RECAPTCHA_SECRET}&response=${Token}`
      }
    );

    const data = await response.json();

    // If using reCAPTCHA v3 → check score
    if (!data.success || (data.score && data.score < 0.7)) {
      await delay(2000);
      return res.status(400).json({
        success: false,
        message: "Bot detected"
      });
    }

    // ===============================
    // 💾 3. Save Student (Mongo handles duplicates)
    // ===============================
    await Student.create({
      ...req.body
    });

    return res.status(201).json({
      success: true,
      message: "Student registered successfully"
    });

  } catch (error) {

    // Duplicate key error (Mongo unique index)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Duplicate ${field} value`
      });
    }

    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = register;