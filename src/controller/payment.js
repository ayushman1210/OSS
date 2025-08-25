const crypto=require('crypto')
const { createRazorpayInstance } = require('../config/config');
const razorpayinstance = createRazorpayInstance();
const User=require('../model/student')
const email=require('../utility/mailer')


exports.order = async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }

  const options = {
    amount: amount * 100, // amount in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`, // Unique ID for tracking
  };

  try {
    razorpayinstance.orders.create(options, (err, order) => {
      if (err) {
        console.error("Error creating Razorpay order:", err);
        return res.status(500).json({ success: false, error: err });
      }
      return res.status(200).json(order);
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Unexpected server error" });
  }
};




exports.verifypayment = async (req, res) => {
  const { order_id, payment_id, signature, formData, contactData } = req.body;
  if (!order_id || !payment_id || !signature || !contactData?.Email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const secret = process.env.RAZOR_KEY;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(order_id + "|" + payment_id);
  const generatedSign = hmac.digest("hex");


  if (generatedSign != signature) {
    return res.status(400).json({ success: false, message: "❌ Signature mismatch" });
  }


  try {
    let user = await User.findOne({ Email: contactData.Email });

    if (!user) {
      console.log("🆕 User not found. Creating new user.");
      user = new User({
        ...formData,
        ...contactData,
        payment: true,
        order_id,
         payment_id,
         signature
      });
    }
    else {
      console.log("✅ User found. Updating user.");
      Object.assign({user, ...formData, ...contactData,  payment:true ,order_id, payment_id, signature});
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


// exports.savepayment=async(req,res)=>{
//   const { order_id , payment_id,signature,formData,contactData}=req.body;
//  const stud= await User.create(req.body);
//   res.status(200).json({
//     success:true,
//     stud,
//   })

exports.savepayment = async (req, res) => {
  try {
    const { order_id, payment_id, signature, formData, contactData } = req.body;

    if (!order_id || !payment_id || !signature) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    // Merge formData and contactData if needed
    const userData = {
      ...formData,
      ...contactData,
      payment_id,
      order_id,
      signature,
    };

    // Only pass fields that match the User schema
    //const stud = await User.create(userData);

    res.status(200).json({
      success: true,
      //stud,
    });
  } catch (err) {
    console.error("Error saving payment:", err);
    res.status(400).json({
      success: false,
      message: "Could not save user data",
      error: err.message,
    });
  }
};
