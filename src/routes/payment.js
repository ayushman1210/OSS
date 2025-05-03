const express=require('express')
const router=express.Router();
const {order,verifypayment,savepayment}=require('../controller/payment')

router.post('/createOrder',order);
router.post('/verifypayment',verifypayment);
router.post('/savepayment',savepayment)
module.exports=router;