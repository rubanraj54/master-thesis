import mongoose from 'mongoose'

const Task = mongoose.model('Task', {
    name: String,
    context: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Context'
    }
})

export default Task