import mongoose from 'mongoose'
const uuid = require('uuid/v4');

const Context = mongoose.model('Context', {
    _id: {
        type: String,
        default: uuid
    },
    name: String,
    value: mongoose.Schema.Types.Mixed
})

export default Context