import mongoose from 'mongoose'

const Task = mongoose.model('Task', {
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