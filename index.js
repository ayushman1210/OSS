const express=require('express');
const connectdb = require('./src/db/db');
const cors=require('cors')
const router=require('./src/routes/payment')
const app=express();
const recaptcha=require('./src/routes/recaptcha')
const register=require('./src/routes/student')
const rateLimit=require('express-rate-limit')
const cron=require('node-cron')
require('dotenv').config()
port=process.env.PORT

app.use(express.json())

app.use(cors({
    // origin:'https://www.ossrndc.in',
    origin:'https://registerpage-1a46.vercel.app/',
    methods:["GET","POST"],
    crendentials:true
}))

// app.use(cors());
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later",
    headers: true,
  });

  app.use(limiter);
app.use('/api/v1',register)
app.use('/api/v1',router)
app.use('/api/v1',recaptcha)

app.get('/',(req,res)=>{
    res.send("welcome")
})
const schedule= cron.schedule('*/10 * * * *', () => {
    console.log("server running")
});
app.listen(port,async()=>{
    console.log(`${port} is working `)
    await connectdb(process.env.MONGO_URI);
    await schedule;
    console.log("connect db ")
})
