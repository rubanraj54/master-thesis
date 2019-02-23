import mongoose from 'mongoose'
const uuid = require('uuid/v4');
const TaskRobotSensor = mongoose.model('TaskRobotSensor', {
    _id: {
        type: String,
        default: uuid,
    },
    task: {
        type: String,
        default: uuid,
        ref: 'Task'
    },
    robot: {
        type: String,
        default: uuid,
        ref: 'Robot'
    },
    sensor: {
        type: String,
        default: uuid,
        ref: 'Sensor'
    },
    timestamp: Date
})

export default TaskRobotSensor