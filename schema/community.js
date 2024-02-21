const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const communitySchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        maxlength: 128
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    owner: {
        type: String,
        required: true,
        ref: 'User' // Assuming 'User' is the name of the user schema
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

const Community = mongoose.model('communities', communitySchema);

module.exports = {Community};
