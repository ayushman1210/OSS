const crypto=require('crypto')
const { createRazorpayInstance } = require('../config/config');
const razorpayinstance = createRazorpayInstance();
const User=require('../model/student')
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


exports.verifypayment=async (req,res)=>{
    const{order_id,payment_id,signature, Email}=req.body;

    if (!order_id || !payment_id || !signature || !Email) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      

    const secret=process.env.RAZOR_KEY;
    const hmac=crypto.createHmac("sha256",secret);
    hmac.update(order_id+"|"+payment_id);
    const genratedsign=hmac.digest("hex");
    if(genratedsign===signature){
      try {
        const updatedUser = await User.findOneAndUpdate(
          { Email  },
          { $set: { payment: true } },
          { new: true }
        );
  
        if (!updatedUser) {
          return res.status(404).json({ success: false, message: "User not found" });
        }
  
        return res.status(200).json({
          success: true,
          message: "Payment verified and user updated",
          user: updatedUser,
        });
      } catch (error) {
        console.error("Error updating user payment status:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
      }
    } 
    else {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

}
