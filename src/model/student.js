const mongoose=require('mongoose');

const studentSchema= new mongoose.Schema({
    Name:{
        type:String,
        Maxlength:20,
    },
    StudentNO:{
        type:String,
        Maxlength:10,
    },
    Gender:{
        type:String
    },
    Branch:{
        type:String
    },
    Year:{
        type:String
    },
    contact:{
        type:Number
    },
    Email:{
        type:String,
        unique:true,
        sparse:true
    },
    // paymentId: {
    //     type: String,
    //     required: true,
    //     unique: true,
    //   },
     payment:{
        type:Boolean,
        default:false
     }
})

const student= new mongoose.model("student",studentSchema);

module.exports=student;