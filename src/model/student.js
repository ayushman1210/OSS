const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  Name: String,
  StudentNO: String,
  Gender: String,
  Branch: String,
  Domain: String,
  contact: {
    type: Number,
    unique: true
  },
  Email: {
    type: String,
    unique: true
  },
  Residence: String,

  payment: {
    type: Boolean,
    default: true
  },

  transactionId: {
    type: String,
    unique: true,
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("student", studentSchema);
