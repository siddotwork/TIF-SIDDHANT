const express = require('express');
const app = express();
const randomstring = require('@theinternetfolks/snowflake');
app.use(express.json());
const { Community } = require('../schema/community');
const { User } = require('../schema/signup');
const { Member } = require('../schema/members');
const { Role } = require('../schema/roles');
const slugify = require('slug');

function generateSlug(name) {
    return slugify(name, {
        lower: true,      // Convert to lowercase
        replacement: '-', // Replace whitespaces with hyphens
        remove: /[*+~.()'"!:@]/g // Remove special characters except -
    });
}

async function createCommunity(name, id) {
    try {
        console.log(id);
        if(name.length<2){
            return{
                status: false,
                errors: [
                  {
                    param: "name",
                    message: "Name should be at least 2 characters.",
                    code: "INVALID_INPUT"
                  }
                ]
              }
        }
        
        const owner = await User.findOne(id);
        
        if (!owner) {
            return { status: false, error: 'User not found' };
        }

        const existingCommunity = await Community.findOne({ name });
        if (existingCommunity) {
            return { status: false, error: 'Community name already exists' };
        }
        
        const community = new Community({ id: randomstring.Snowflake.generate(), name, owner: owner.name, slug: generateSlug(name) });
        await community.save();

        const adminRoleId = await Role.findOne({ name: "Community Admin" });
        const adminAdd = new Member({ id: randomstring.Snowflake.generate(), community: community.id, role: adminRoleId.id, user:owner.id });
        await adminAdd.save();
        console.log(adminAdd.save());


        const responseData = {
            status: true,
            content: {
                data: {
                    id: community.id,
                    name: community.name,
                    slug: community.slug,
                    owner: community.owner,
                    created_at: community.created_at.toISOString(),
                    updated_at: community.updated_at.toISOString()
                }
            }
        };

        return responseData;
    } catch (error) {
        console.error('Error creating community:', error);
        return { status: false, error: 'Internal server error' };
    }
}


async function getAllCommunities(req, res, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;

        const communities = await Community.find().skip(skip).limit(limit);

        const totalCommunities = await Community.countDocuments();

        const totalPages = Math.ceil(totalCommunities / limit);

        const expandedCommunities = await Promise.all(communities.map(async (community) => {
            // Fetch owner details
            const owner = await User.findOne({ name: community.owner });
            if (owner) {
                // Return only id and name of the owner
                return {
                    id: community.id,
                    name: community.name,
                    slug: community.slug,
                    owner: {
                        id: owner.id,
                        name: owner.name
                    },
                    created_at: community.created_at.toISOString(),
                    updated_at: community.updated_at.toISOString()
                };
            } else {
                return null; // Owner not found
            }
        }));

        // Filter out null values (community without owner)
        const data = expandedCommunities.filter(community => community !== null);

        const responseObj = {
            status: true,
            content: {
                meta: {
                    total: totalCommunities,
                    pages: totalPages,
                    page: page
                },
                data: data
            }
        };

        res.status(200).json(responseObj);
    } catch (error) {
        console.error('Error fetching communities:', error);
        res.status(500).json({ status: false, error: 'Internal server error' });
    }
}

async function getCommunityMembers(slug, page = 1, limit = 10) {
    try {
        // Retrieve the community based on the slug
        const community = await Community.findOne({ slug: slug.id });
        console.log(community);

        if (!community) {
            return { status: false, error: 'Community not found' };
        }

        // Calculate pagination parameters
        const skip = (page - 1) * limit;

        // Retrieve members of the community with pagination
        const members = await Member.find({ community: community.id })
            .skip(skip)
            .limit(limit);

        // Count total number of members in the community
        const totalMembers = await Member.countDocuments({ community: community.id });

        // Calculate total number of pages
        const totalPages = Math.ceil(totalMembers / limit);

        // Fetch role and user details for each member
        const populatedMembers = await Promise.all(members.map(async member => {
            const role = await Role.findOne({ id: member.role });
            const user = await User.findOne({ id: member.user });
            return {
                id: member.id,
                community: member.community,
                user: {
                    id: user.id,
                    name: user.name
                },
                role: {
                    id: role.id,
                    name: role.name
                },
                created_at: member.created_at.toISOString()
            };
        }));

        // Construct response object
        const response = {
            status: true,
            content: {
                meta: {
                    total: totalMembers,
                    pages: totalPages,
                    page: page
                },
                data: populatedMembers
            }
        };

        return response;
    } catch (error) {
        console.error('Error fetching community members:', error);
        return { status: false, error: 'Internal server error' };
    }
}

async function getOwnedCommunities(loggedId, page = 1, limit = 10) {
    try {

        // Calculate pagination parameters
        const skip = (page - 1) * limit;
        const ownerName = await User.findOne({ id: loggedId })
        // Query the database for communities owned by the user
        const ownedCommunities = await Community.find({ owner: ownerName.name })
            .skip(skip)
            .limit(limit);


        // Count total number of owned communities
        const totalOwnedCommunities = await Community.countDocuments({ owner: loggedId });

        // Calculate total number of pages
        const totalPages = Math.ceil(totalOwnedCommunities / limit);

        // Construct response object
        const response = {
            status: true,
            content: {
                meta: {
                    total: totalOwnedCommunities,
                    pages: totalPages,
                    page: page
                },
                data: ownedCommunities.map(community => ({
                    id: community.id,
                    name: community.name,
                    slug: community.slug,
                    owner: community.owner,
                    created_at: community.created_at.toISOString(),
                    updated_at: community.updated_at.toISOString()
                }))
            }
        };

        return response
    } catch (error) {
        console.error('Error fetching owned communities:', error);
        return { status: false, error: 'Internal server error' }
    }
}
async function getMemberCommunities(userId, page = 1, limit = 10) {
    try {
        // Calculate pagination parameters
        const skip = (page - 1) * limit;

        // Query the database for communities where the user is a member
        const memberCommunities = await Member.find({ user: userId })
            .skip(skip)
            .limit(limit);

        // Count total number of member communities
        const totalMemberCommunities = await Member.countDocuments({ user: userId });
        

        // Calculate total number of pages
        const totalPages = Math.ceil(totalMemberCommunities / limit);

        // Fetch additional details for each community
        const dataPromises = memberCommunities.map(async (member) => {
            const community = await Community.findOne({id:member.community});
            

            if (!community) {
                return null; // Handle this case as needed
            }

            return {
                id: community.id,
                name: community.name,
                slug: community.slug,
                owner: {
                    id: community.owner,
                    name: "Owner Name" // Fetch owner details as needed
                },
                created_at: community.created_at.toISOString(),
                updated_at: community.updated_at.toISOString()
            };
        });

        // Wait for all dataPromises to resolve
        const data = await Promise.all(dataPromises);

        // Filter out null values (in case of community not found)
        const filteredData = data.filter(item => item !== null);

        // Construct response object
        const response = {
            status: true,
            content: {
                meta: {
                    total: totalMemberCommunities,
                    pages: totalPages,
                    page: page
                },
                data: filteredData
            }
        };

        return response;
    } catch (error) {
        console.error('Error fetching member communities:', error);
        return { status: false, error: 'Internal server error' };
    }
}



module.exports = {
    createCommunity, getAllCommunities, getCommunityMembers, getOwnedCommunities,getMemberCommunities
}