const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the user schema
const userSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now, // Set default value to current date/time
    }
});


// Create the User model
const User = mongoose.model('User', userSchema);

module.exports ={ User}
