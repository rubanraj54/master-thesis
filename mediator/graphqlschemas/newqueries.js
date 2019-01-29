
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
            
                allAccelorometerSensorObservations: async (parent, args, {Robot, Sensor,Context,AccelorometerSensorObservation,VelocitySensorObservation,VelocitySensor2Observation,VelocitySensor3Observation,VelocitySensor4Observation}) => {
                    const observations = await AccelorometerSensorObservation.find(args).populate('robot').populate({
                        path: 'sensor',
                        populate : {
                            path: "context",
                            model: "Context"
                        }
                    })
                    return observations.map(x => {
                        x._id = x._id.toString()
                        return x
                    })
                },            
            

                allVelocitySensorObservations: async (parent, args, {Robot, Sensor,Context,AccelorometerSensorObservation,VelocitySensorObservation,VelocitySensor2Observation,VelocitySensor3Observation,VelocitySensor4Observation}) => {
                    const observations = await VelocitySensorObservation.find(args).populate('robot').populate({
                        path: 'sensor',
                        populate : {
                            path: "context",
                            model: "Context"
                        }
                    })
                    return observations.map(x => {
                        x._id = x._id.toString()
                        return x
                    })
                },            
            

                allVelocitySensor2Observations: async (parent, args, {Robot, Sensor,Context,AccelorometerSensorObservation,VelocitySensorObservation,VelocitySensor2Observation,VelocitySensor3Observation,VelocitySensor4Observation}) => {
                    const observations = await VelocitySensor2Observation.find(args).populate('robot').populate({
                        path: 'sensor',
                        populate : {
                            path: "context",
                            model: "Context"
                        }
                    })
                    return observations.map(x => {
                        x._id = x._id.toString()
                        return x
                    })
                },            
            

                allVelocitySensor3Observations: async (parent, args, {Robot, Sensor,Context,AccelorometerSensorObservation,VelocitySensorObservation,VelocitySensor2Observation,VelocitySensor3Observation,VelocitySensor4Observation}) => {
                    const observations = await VelocitySensor3Observation.find(args).populate('robot').populate({
                        path: 'sensor',
                        populate : {
                            path: "context",
                            model: "Context"
                        }
                    })
                    return observations.map(x => {
                        x._id = x._id.toString()
                        return x
                    })
                },            
            

                allVelocitySensor4Observations: async (parent, args, {Robot, Sensor,Context,AccelorometerSensorObservation,VelocitySensorObservation,VelocitySensor2Observation,VelocitySensor3Observation,VelocitySensor4Observation}) => {
                    const observations = await VelocitySensor4Observation.find(args).populate('robot').populate({
                        path: 'sensor',
                        populate : {
                            path: "context",
                            model: "Context"
                        }
                    })
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
        