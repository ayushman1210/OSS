const express=require('express');

const recaptcha=require('../controller/recaptcha')
const router=express.Router();

router.route('/recaptcha').post(recaptcha);

module.exports=router;