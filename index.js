
const dns = require("dns");

// Force Node to use Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

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


app.use(express.static('public'));

app.use(express.json())

app.get("/ping", (req, res) => res.send("pong"));

app.use(cors({
    // origin:'https://www.ossrndc.in',
    origin:['https://registerpage-1a46.vercel.app','https://www.ossrndc.in','https://registerpage-phi.vercel.app', "http://localhost:5173"],
    methods:["GET","POST"],
    credentials:true,
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(cors());
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

const axios = require("axios");

setInterval(async () => {
  try {
    const res = await axios.get("https://oss-ea26.onrender.com/ping");
    console.log("Pinged:", res.data);
  } catch (err) {
    console.log("Ping error nkjsdfsdfk :", err.message);
  }
}, 1* 60 * 200); // every  minutes


app.listen(port,async()=>{
    console.log(`${port} is working `)
    await connectdb(process.env.MONGO_URL);
    await schedule;
    console.log("connect db ")
})
