const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const randomstring = require('@theinternetfolks/snowflake');
const {User} = require('../schema/signup');
const validator=require('validator');

require('dotenv').config();
app.use(express.json());

async function signUp(name, email, password) {
    try {
        // Validate input
        if (!validator.isEmail(email)) {
            return { status: false, error: 'Invalid email format', code: 'INVALID_EMAIL_FORMAT' };
        }
        if (!validator.isStrongPassword(password)) {
            return { status: false, error: 'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character', code: 'INVALID_PASSWORD' };
        }
        if (!validator.isLength(name, { min: 2 })) {
            return { status: false, error: 'Name should be at least 2 characters.', code: 'INVALID_NAME_LENGTH' };
        }

        // Sanitize inputs to prevent XSS attacks
        name = validator.escape(name.trim());
        email = validator.normalizeEmail(email.trim());

        // Check if the username is already taken
        const existingName = await User.findOne({ name });
        if (existingName) {
            return { status: false, error: 'Username already taken', code: 'USERNAME_ALREADY_TAKEN' };
        }

        // Check if the email is already taken
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return { status: false, error: 'Email already taken', code: 'EMAIL_ALREADY_TAKEN' };
        }

        // Hash the password securely
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a random ID securely
        const id = randomstring.Snowflake.generate();

        // Generate JWT token securely
        const token = jwt.sign({ name, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Create a new user instance
        const newUser = new User({ id, name, email, password: hashedPassword });

        // Save the user to the database
        await newUser.save();

        // Construct response data
        const responseData = {
            status: true,
            content: {
                data: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    created_at: newUser.createdDate.toISOString()
                },
                meta: {
                    access_token: token
                }
            }
        };

        // Return success response
        return responseData;
    } catch (error) {
        // Log the error for debugging purposes
        console.error('Error in signUp:', error);
        return { status: false, error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' }; // Return error response
    }
}




async function login(email, password) {
    try {
        // Validate email length and format
        if (!validator.isLength(email, { min: 1, max: 255 }) || !validator.isEmail(email)) {
            return { status: false, errors: [{ param: 'email', message: 'Please provide a valid email address.', code: 'INVALID_INPUT' }] };
        }

        // Find the user in the database
        const user = await User.findOne({ email });
      
        if (!user) {
            return { status: false, errors: [{ param: 'email', message: 'The credentials you provided are invalid.', code: 'INVALID_CREDENTIALS' }] };
        }

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return { status: false, errors: [{ param: 'password', message: 'The credentials you provided are invalid.', code: 'INVALID_CREDENTIALS' }] };
        }

        // Generate a JWT token with the user id as part of the payload
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Prepare response data
        const responseData = {
            status: true,
            content: {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.createdDate.toISOString()
                },
                meta: {
                    access_token: token
                }
            }
        };

        return responseData;
    } catch (error) {
        // Log the error for debugging purposes
        console.error('Error in logging:', error);
        return { status: false, error: 'Internal server error' };
    }
}


function authenticateToken(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err,decoded) => {
        if (err) {
            return res.status(401).json({
                status: false,
                errors: [
                  {
                    message: "You need to sign in to proceed.",
                    code: "NOT_SIGNEDIN"
                  }
                ]
              });
        }

        // Extract the user ID from the decoded JWT payload
        req.id =decoded.id;
        next();
    });
}


async function getUserDetails(req, res) {
    try {
        // Extract the user ID from the request object
        const id = req.id;

        // Find the user in the database based on the ID
        const user = await User.findOne({id:id})

        if (!user) {
            return res.status(404).json({ status: false, error: 'User not found' });
        }

        // Prepare the response data
        const responseData = {
            status: true,
            content: {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.createdDate.toISOString()
                }
            }
        };

        res.status(200).json(responseData);
    } catch (error) {
        // Handle errors
        console.error('Error in getUserDetails:', error);
        res.status(500).json({ status: false, error: 'Internal server error' });
    }
}



module.exports = { signUp,login,getUserDetails,authenticateToken }