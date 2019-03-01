import mongoose from 'mongoose'
const uuid = require('uuid/v4');

const Sensor = mongoose.model('Sensor', {
    _id: {
        type: String,
        default: uuid,
    },
    name: String,
    type: String,
    description: String,
    measures: String,
    value_schema: mongoose.Schema.Types.Mixed,
    unit: String,
    meta: mongoose.Schema.Types.Mixed,
    context: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Context'
    }
})

export default Sensor