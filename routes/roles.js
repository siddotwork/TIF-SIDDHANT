const router=require('express').Router();
const{createRoleController}=require('../controllers/roles');
const{getAllRoles}=require('../utils/roles');

router.post('/',createRoleController)
router.get('/',getAllRoles)

module.exports=router