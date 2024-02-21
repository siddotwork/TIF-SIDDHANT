const{createCommunity,getCommunityMembers,getOwnedCommunities,getMemberCommunities}=require('../utils/community');

async function createCommunityController(req, res) {
    try {
        const { name } = req.body;
        const id = req.userId;
        const communityResponse = await createCommunity(name, id);

        if (!communityResponse.status) {
            return res.status(400).json(communityResponse);
        }

        res.status(communityResponse.status ? 201 : 500).json(communityResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, error: 'Internal server error' });
    }
}


async function getMembersController(req, res) {
    try {
        const  slug = req.params
        const allMembers = await getCommunityMembers(slug)
        res.status(allMembers.status ? 201 : 500).json(allMembers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, error: 'Internal server error' });
    }
}

async function getMyOwnedController(req,res){
    try {
        const id=req.id
        const allOwned = await getOwnedCommunities(id)
        res.status(allOwned.status ? 201 : 500).json(allOwned);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, error: 'Internal server error' });
    }
}

async function memberCommunityController(req,res){
    try {
        const id=req.id
        const meMember = await getMemberCommunities(id)
        res.status(meMember.status ? 201 : 500).json(meMember);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, error: 'Internal server error' });
    }
}

module.exports={
    createCommunityController,getMembersController,getMyOwnedController,memberCommunityController
}