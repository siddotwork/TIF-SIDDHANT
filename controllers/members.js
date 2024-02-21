const{addMembers,removeMember}=require('../utils/members');
async function addMemberController(req, res) {
    try {
        const { commId,userId,roleId} = req.body;
        const id = req.id;
        const addMemberResponse = await addMembers(id,commId,userId,roleId);
        if (!addMemberResponse.status) {
            return res.status(400).json(addMemberResponse);
        }
        res.status(addMemberResponse.status ? 201 : 500).json(addMemberResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, error: 'Internal server error' });
    }
}

async function deleteMemberController(req,res){
    try {
        const loggedId=req.id;
        const id=req.params;
        const removeMemberResponse=await removeMember(loggedId,id);
        if (!removeMemberResponse.status) {
            return res.status(400).json(removeMemberResponse);
        }
        res.status(removeMemberResponse.status ? 201 : 500).json(removeMemberResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, error: 'Internal server error' });
    }
}

module.exports={
    addMemberController,deleteMemberController
}
