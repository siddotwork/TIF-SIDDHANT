// role.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique:true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Role = mongoose.model('Role', roleSchema);

module.exports = {Role};
