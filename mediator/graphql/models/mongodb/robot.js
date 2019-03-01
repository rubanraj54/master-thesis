import mongoose from 'mongoose'
const uuid = require('uuid/v4');

const Robot = mongoose.model('Robot', {
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

export default Robot