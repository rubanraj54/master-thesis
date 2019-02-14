import mongoose from 'mongoose'

const Context = mongoose.model('Context', {
  name: String,
  value: mongoose.Schema.Types.Mixed
})

export default Context
