const user=require('../model/student')

const verify = async (req, res) => {
    const { Token } = req.body;
    const {formData, contactData}=req.body;
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

        res.status(200).json({ success: true, message: "Verified successfully" });
    } catch (error) {
        console.error("error in verification", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }

      try {
    
        if (!user) {
          console.log("🆕 User not found. Creating new user.");
          user = new user({
            ...formData,
            ...contactData,
            // payment: true,
            // order_id,
            //  payment_id,
            //  signature
          });
        }
        else {
          console.log("✅ User found. Updating user.");
          Object.assign({user, ...formData, ...contactData});
        }
    
        await user.save();
    
        const message = `Hi ${formData.Name} ,\n\nYour payment was successful with payment id ${payment_id} \n\n. Thank you for registering!!  `;
        await email(contactData.Email, 'Payment Confirmation', message);
    
    
        console.log("✅ User after save:", user);
    
        return res.status(200).json({
          success: true,
          message: "✅ Payment verified and user saved",
          user,
        });
      } catch (error) {
        console.error("❌ Error saving user:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
      }
};

module.exports = verify;
