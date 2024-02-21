const{createRole}=require('../utils/roles');

async function createRoleController(req, res) {
    try {
        const { name } = req.body;
        
        // Call the createRole function to create the role
        const roleResponse = await createRole(name);

        // Check if the status is false and the error is due to invalid input
        if (!roleResponse.status && roleResponse.errors && roleResponse.errors[0].code === 'INVALID_INPUT') {
            // Return a 400 status code for bad request
            return res.status(400).json(roleResponse);
        }

        // Return the appropriate status code based on the role creation response
        res.status(roleResponse.status ? 201 : 500).json(roleResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, error: 'Internal server error' });
    }
}


module.exports={
    createRoleController
}