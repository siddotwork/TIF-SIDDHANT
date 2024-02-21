const express = require('express');
const app = express();
const randomstring = require('@theinternetfolks/snowflake');
app.use(express.json());
// roleController.js

const {Role} = require('../schema/roles');

async function createRole(name) {
    try {
        // Validate the length of the name
        if (name.length < 2) {
            return {
                status: false,
                errors: [
                    {
                        param: 'name',
                        message: 'Name should be at least 2 characters.',
                        code: 'INVALID_INPUT'
                    }
                ]
            };
        }

        const role = new Role({ id: randomstring.Snowflake.generate(), name });
        await role.save();
        return {
            status: true,
            content: {
                data: {
                    id: role.id,
                    name: role.name,
                    created_at: role.createdAt.toISOString(),
                    updated_at: role.updatedAt.toISOString()
                }
            }
        };
    } catch (error) {
        console.error('Error creating role:', error);
        return { status: false, error: 'Internal server error' };
    }
}



async function getAllRoles(req,res,page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;

        const roles = await Role.find().skip(skip).limit(limit);
        
        const totalRoles = await Role.countDocuments();

        const totalPages = Math.ceil(totalRoles / limit);

        const responseObj={
            status: true,
            content: {
                meta: {
                    total: totalRoles,
                    pages: totalPages,
                    page: page
                },
                data: roles.map(role => ({
                    id: role.id,
                    name: role.name,
                    created_at: role.createdAt.toISOString(),
                    updated_at: role.updatedAt.toISOString()
                }))
            }
        };
        res.status(200).json(responseObj);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ status: false, error: 'Internal server error' });
    }
}




module.exports = { createRole, getAllRoles };

