const mongoose=require('mongoose')
const connectdb=async(URI)=>{
return mongoose.connect(URI);
}

module.exports=connectdb;