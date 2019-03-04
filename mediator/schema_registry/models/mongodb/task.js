import mongoose from 'mongoose'
const uuid = require('uuid/v4');

module.exports = (connection) => {
    const Task = connection.model('Task', {
        _id: {
            type: String,
            default: uuid,
        },
        name: String,
        context: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Context'
        }
    })
    return Task;
}