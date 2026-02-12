// const Student = require('../model/student');

// const register = async (req, res) => {
//   try {
//     const student = await Student.create(req.body);

//     res.status(201).json({
//       success: true,
//       message: "Student registered successfully",
//       data: student
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// module.exports = register;


const Student = require('../model/student');

const register = async (req, res) => {
  try {

    const transactionId = "TXN" + Date.now() + Math.floor(Math.random() * 1000);

    const student = await Student.create({
      ...req.body,
      transactionId,
      payment: false
    });

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: student
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = register;
