import mongoose from 'mongoose'
const uuid = require('uuid/v4');

module.exports = (connection) => {
    const Context = connection.model('Context', {
        _id: {
            type: String,
            default: uuid
        },
        name: String,
        value: mongoose.Schema.Types.Mixed
    })
    return Context;
}