import mongoose from 'mongoose'

const RobotSensor = mongoose.model('RobotSensor', {
    robot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Robot'
    },
    sensor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sensor'
    },
    timestamp: Date
})

export default RobotSensor