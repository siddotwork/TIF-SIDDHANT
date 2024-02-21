const{signUp,login,getUserDetails}=require('../utils/signup');
async function signUpController(req, res) {
    try {
        const { name, email, password } = req.body;
        const signUpResponse = await signUp(name, email, password);
        if (!signUpResponse.status) {
            res.status(400).json(signUpResponse);
        } else {
            res.status(201).json(signUpResponse);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
    }
}


async function loginController(req, res) {
    try {
        const { email, password } = req.body;
        const loginResponse = await login(email, password);
        
        if (!loginResponse.status) {
            return res.status(400).json(loginResponse);
        }

        res.status(201).json(loginResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, error: 'Internal server error' });
    }
}


module.exports={
    signUpController,loginController
}