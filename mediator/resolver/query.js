export default {
    allRobots: async (parent, args, { Robot, Sensor }) => {
      const robots = await Robot.find(args)
      return robots.map(x => {
        x._id = x._id.toString()
        return x
      })
    },
    allSensors: async (parent, args, { Robot, Sensor }) => {
      const sensors = await Sensor.find(args)
      return sensors.map(x => {
        x._id = x._id.toString()
        return x
      })
    },
    allTemperatureObservations: async (parent, args, { Robot, Sensor,TemperatureObservation }) => {
      const temperatureObservations = await TemperatureObservation.find(args).populate('robot').
      populate('sensor')
      return temperatureObservations.map(x => {
        x._id = x._id.toString()
        return x
      })
    },
    getRobot: async (parent, args, { Robot, Sensor}) => {
      const robot = await Robot.findById(args.id)
      return robot
    }
  }