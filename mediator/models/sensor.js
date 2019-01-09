import mongoose from 'mongoose'

const Sensor = mongoose.model('Sensor', {
  name: String,
  type: String,
  description: String,
  measures: String,
  value_schema: String,
  unit: String,
  meta: mongoose.Schema.Types.Mixed
})

export default Sensor
