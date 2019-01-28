import mongoose from 'mongoose'

const AccelerometerObservation = mongoose.model('AccelerometerObservation', {
    value: [{
        x: Number,
        y: Number,
        z: Number
    }]
})

export default AccelerometerObservation