const express = require('express');
const app = express();
const randomstring = require('@theinternetfolks/snowflake');
app.use(express.json());
const { Member } = require('../schema/members');
const { Community } = require('../schema/community');
const { User } = require('../schema/signup');
const { Role } = require('../schema/roles');


async function addMembers(loggedId, commId, userId, roleId) {
    try {
        const commDetails = await Community.findOne({ id: commId });

        if (!commDetails) {
            return { status: false, errors: [{ param: 'community', message: 'Community not found.', code: 'RESOURCE_NOT_FOUND' }] };
        }

        const getId = await User.findOne({ name: commDetails.owner });

        if (!getId) {
            return { status: false, errors: [{ param: 'user', message: 'User not found.', code: 'RESOURCE_NOT_FOUND' }] };
        }

        if (getId.id !== loggedId) {
            return { status: false, errors: [{ message: 'You are not authorized to perform this action.', code: 'NOT_ALLOWED_ACCESS' }] };
        }

        const existingMember = await Member.findOne({ community: commId, user: userId });

        if (existingMember) {
            return { status: false, errors: [{ message: 'User is already added in the community.', code: 'RESOURCE_EXISTS' }] };
        }

        const role = await Role.findOne({ id: roleId });

        if (!role) {
            return { status: false, errors: [{ param: 'role', message: 'Role not found.', code: 'RESOURCE_NOT_FOUND' }] };
        }

        const newMember = new Member({
            id: randomstring.Snowflake.generate(),
            community: commId,
            user: userId,
            role: roleId
        });

        await newMember.save();

        // Prepare the response data
        const responseData = {
            status: true,
            content: {
                data: {
                    id: newMember.id,
                    community: newMember.community,
                    user: newMember.user,
                    role: newMember.role,
                    created_at: newMember.created_at.toISOString()
                }
            }
        };

        return responseData;
    } catch (error) {
        console.error('Error adding member:', error);
        return { status: false, error: 'Internal server error' };
    }
}


async function removeMember(loggedId, id) {
    try {
        const member = await Member.findOne({ id:id.id});
        if (!member) {
            return {
                status: false,
                errors: [
                    {
                        message: "Member not found.",
                        code: "RESOURCE_NOT_FOUND"
                    }
                ]
            };
        }
        
        const isAdmin= await Member.findOne({user:loggedId})
        
        const roles = await Role.findOne({ id:isAdmin.role });
        console.log(roles);
        if (roles.name === "Community Admin" || roles.name === "Community Moderator") {
            const deleted = await Member.findOneAndDelete({ id: id });
            console.log(deleted);
            if(deleted!==null){
                return { status: true };
            }
            
        } else {
            return {
                error: "NOT_ALLOWED_ACCESS"
            };
        }
    } catch (error) {
        console.error('Error removing member:', error);
        return { status: false, error: 'Internal server error' };
    }
}

module.exports = {
    addMembers, removeMember
}

