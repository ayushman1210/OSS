const student=require('../model/student')
const mongoose=require('mongoose')


const register=async(req,res)=>{
try{const data = req.body;
const user = new student(data)
console.log(data);
await user.save(data);
res.status(200).send(user)}catch(e){
    console.log(e)
}
}


module.exports=register;