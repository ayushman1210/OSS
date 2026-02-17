const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  Name: String,
  StudentNO: String,
  Gender: String,
  Branch: String,
  Domain: String,
  contact: Number,
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
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model("student", studentSchema);
