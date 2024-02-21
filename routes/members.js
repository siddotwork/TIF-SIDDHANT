const router=require('express').Router();
const{addMemberController,deleteMemberController}=require('../controllers/members');
const{authenticateToken}=require('../utils/signup');

router.post('/',authenticateToken,addMemberController)
router.delete('/:id',authenticateToken,deleteMemberController)


module.exports=router