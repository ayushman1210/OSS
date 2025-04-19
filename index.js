const express=require('express');
const connectdb = require('./src/db/db');
const cors=require('cors')
const router=require('./src/routes/payment')
const app=express();
const recaptcha=require('./src/routes/recaptcha')
const register=require('./src/routes/student')
require('dotenv').config()
port=process.env.PORT

app.use(express.json())
app.use(cors())
app.use('/api/v1',register)
app.use('/api/v1',router)
app.use('/api/v1',recaptcha)

app.get('/',(req,res)=>{
    res.send("welcome")
})
app.listen(port,async()=>{
    console.log(`${port} is working `)
    await connectdb(process.env.MONGO_URI);
    console.log("connect db ")
})
