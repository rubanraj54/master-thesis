export default {
    createRobot: async (parent, args, { Robot, Sensor }) => {
      const robot = await new Robot(args).save()
      robot._id = robot._id.toString()
      return robot
    },
    createSensor: async (parent, args, { Robot, Sensor }) => {
      const sensor = await new Sensor(args).save()
      sensor._id = sensor._id.toString()
      return sensor
    },
    createTemperatureObservation: async (_, {input}, { Robot, Sensor, TemperatureObservation }) => {
      const temperatureObservation = await new TemperatureObservation(input).save()
      temperatureObservation._id = temperatureObservation._id.toString()
      return temperatureObservation
    }
  }