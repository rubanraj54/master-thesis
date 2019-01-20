export default {
    allRobots: async (parent, args, { Robot, Sensor }) => {
      const robots = await Robot.find(args).populate('context')
      return robots.map(x => {
        x._id = x._id.toString()
        return x
      })
    },
    allSensors: async (parent, args, { Robot, Sensor }) => {
      const sensors = await Sensor.find(args).populate('context')
      return sensors.map(x => {
        x._id = x._id.toString()
        return x
      })
    },
    allContexts: async (parent, args, { Robot, Sensor, Context }) => {
      const contexts = await Context.find(args)
      return contexts.map(x => {
        x._id = x._id.toString()
        return x
      })
    },
    allTemperatureObservations: async (parent, args, { Robot, Sensor,Context, TemperatureObservation }) => {
      const temperatureObservations = await TemperatureObservation.find(args).populate('robot').
      populate('sensor')
      return temperatureObservations.map(x => {
        x._id = x._id.toString()
        return x
      })
    },
    allAccelerometerObservations: async (parent, args, {
                Robot,
                Sensor,
                Context,
                TemperatureObservation,
                AccelerometerObservation
            }) => {
      const accelerometerObservation = await AccelerometerObservation.find(args)
      return accelerometerObservation.map(x => {
        x._id = x._id.toString()
        return x
      })
    },
    getRobot: async (parent, args, { Robot, Sensor}) => {
      const robot = await Robot.findById(args.id)
      return robot
    }
  }