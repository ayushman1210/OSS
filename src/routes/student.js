const express=require('express');
const register = require('../controller/student');

const router=express.Router();

router.route('/').post(register);

module.exports=router;
