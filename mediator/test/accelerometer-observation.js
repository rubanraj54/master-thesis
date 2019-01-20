
import mongoose from 'mongoose'

const Observation = mongoose.model('AccelerometerObservation', {
    name: String,
    type: String,
    featureOfInterest: String,
    sensor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sensor'
    },
    robot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Robot'
    },
    value: {
        x: Number,
        y: Number,
        z: Number
    }
})

export default Observation
