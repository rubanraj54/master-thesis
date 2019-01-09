import mongoose from 'mongoose'

const Robot = mongoose.model('Robot', {
  name: String,
  type: String,
  mac_address: String,
})

export default Robot
