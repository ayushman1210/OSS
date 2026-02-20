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

// const generateTransactionId = () => "TXN" + Date.now() + Math.floor(Math.random() * 1000);

const register = async (req, res) => {
  try {
    const { transactionId, contact } = req.body;

    if (transactionId) {
      const existingStudent = await Student.findOne({ transactionId });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: "Transaction ID already exists. Please use a unique one."
        });
      }
    }

    if (contact) {
      const existingContact = await Student.findOne({ contact });
      if (existingContact) {
        return res.status(400).json({
          success: false,
          message: "Contact already exists. Please provide a different contact number."
        });
      }
    }


    const student = await Student.create({
      ...req.body,
    });

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: student
    });

  } catch (error) {
    if (error.code === 11000) {
      const field = error.keyValue ? Object.keys(error.keyValue)[0] : 'field';
      return res.status(400).json({
        success: false,
        message: `Duplicate ${field} value, try again with a unique ${field}`
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = register;
