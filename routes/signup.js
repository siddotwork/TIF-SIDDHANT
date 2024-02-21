const router=require('express').Router();
const{signUpController,loginController}=require('../controllers/signup');
const{getUserDetails,authenticateToken}=require('../utils/signup');


router.post('/signup',signUpController)
router.post('/login',loginController)
router.get('/me',authenticateToken,getUserDetails)



module.exports=router;