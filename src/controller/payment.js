// src/controller/payment.js

// const order = (req, res) => {
//     res.send("Order created");
// };

// const verifypayment = (req, res) => {
//     res.send("Payment verified");
// };

// const savepayment = (req, res) => {
//     res.send("Payment saved");
// };

// module.exports = { order, verifypayment, savepayment };
const Student = require("../model/student");

const order = async (req, res) => {
  res.json({ message: "Order created (dummy)" });
};

const verifypayment = async (req, res) => {
  res.json({ message: "Payment verified (dummy)" });
};

const savepayment = async (req, res) => {
  try {
    const { email } = req.body;

    const transactionId = "TXN" + Date.now();

    const updatedStudent = await Student.findOneAndUpdate(
      { Email: email },
      { payment: true, transactionId },
      { new: true }
    );

    res.json({
      success: true,
      transactionId,
      data: updatedStudent
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { order, verifypayment, savepayment };
