import mongoose from 'mongoose'

const TaskRobotSensor = mongoose.model('TaskRobotSensor', {
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
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

export default TaskRobotSensor