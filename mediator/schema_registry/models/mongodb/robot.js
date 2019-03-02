import mongoose from 'mongoose'
const uuid = require('uuid/v4');

module.exports = (connection) => {
    const Robot = connection.model('Robot', {
        _id: {
            type: String,
            default: uuid
        },
        name: String,
        type: String,
        mac_address: String,
        context: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Context'
        }
    })
    return Robot;
}