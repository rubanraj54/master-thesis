import mongoose from 'mongoose'
const uuid = require('uuid/v4');

const Task = mongoose.model('Task', {
    _id: {
        type: String,
        default: uuid,
    },
    name: String,
    robot_sensor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RobotSensor'
    },
    context: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Context'
    }
})

export default Task