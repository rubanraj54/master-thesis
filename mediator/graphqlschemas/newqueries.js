
            export default {
            allRobots: async (parent, args, { Robot, Sensor, Context }) => {
                const robots = await Robot.find(args).populate('context')
                return robots.map(x => {
                x._id = x._id.toString()
                return x
                })
            },
            allSensors: async (parent, args, { Robot, Sensor, Context }) => {
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
            
                allAccelorometerSensorObservations: async (parent, args, {Robot, Sensor,Context,AccelorometerSensorObservation}) => {
                    const observations = await AccelorometerSensorObservation.find(args)
                    return observations.map(x => {
                        x._id = x._id.toString()
                        return x
                    })
                },            
            
            // getRobot: async (parent, args, { Robot, Sensor}) => {
            //   const robot = await Robot.findById(args.id)
            //   return robot
            // }
            }
        