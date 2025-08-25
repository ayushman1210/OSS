const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  Name: {
    type: String,
    maxlength: 20,
  },
  StudentNO: {
    type: String,
    maxlength: 10,
  },
  Gender: {
    type: String,
  },
  Branch: {
    type: String,
  },
  Domain: {
    type: String,
  },
  contact: {
    type: Number,
  },
  Email: {
    type: String,
    unique: true,
    sparse: true,
  },
  Residence:{
    type:String
  },
  payment: {
    type: Boolean,
    default: true,
  },
  payment_id: {
    type: String,
  },
  order_id: {
    type: String,
  },
  signature: {
    type: String,
  },
}, { timestamps: true });

const Student = mongoose.model("student", studentSchema);
module.exports = Student;


