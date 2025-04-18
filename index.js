const express=require('express');
const connectdb = require('./src/db/db');
const app=express();
const register=require('./src/routes/student')
require('dotenv').config()
port=process.env.PORT

app.use(express.json())
app.use('/api/v1',register)
app.listen(port,async()=>{
    console.log(`${port} is working `)
    await connectdb(process.env.MONGO_URI);
    console.log("connect db ")
})
