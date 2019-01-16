import mongoose from 'mongoose'

const Robot = mongoose.model('Robot', {
    name: String,
    type: String,
    mac_address: String,
    context: String,
    context: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Context'
    }
})

export default Robot