const router=require('express').Router();
const{createCommunityController,getMembersController,getMyOwnedController,memberCommunityController}=require('../controllers/community');
const { getAllCommunities } = require('../utils/community');
const{authenticateToken}=require('../utils/signup');

router.post('/',createCommunityController)
router.get('/',getAllCommunities)
router.get('/:id/members',getMembersController)
router.get('/me/owner',authenticateToken,getMyOwnedController)
router.get('/me/member',authenticateToken,memberCommunityController)
module.exports=router