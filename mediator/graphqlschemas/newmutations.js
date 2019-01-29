
            const utility = require("../resolver/utils")
            export default {

                createRobot: async (parent, args, { Robot, Sensor }) => {
                    const robot = await new Robot(args).save().then(robot => robot.populate('context').execPopulate())
                    robot._id = robot._id.toString()
                    return robot
                },
                createSensor: async (parent, args, { Robot, Sensor }) => {
                    const sensor = await new Sensor(args).save()
                    sensor._id = sensor._id.toString()
                    return sensor
                },
                createContext: async (parent, args, { Robot, Sensor,Context }) => {
                    const context = await new Context(utility.replaceKeysDeep(args)).save()
                    context._id = context._id.toString()
                    return context
                },
                
                createAccelorometerSensorObservation: async (_, {input}, { Robot, Sensor, Context, AccelorometerSensorObservation,VelocitySensorObservation,VelocitySensor2Observation,VelocitySensor3Observation,VelocitySensor4Observation }) => {
                const observation = await new AccelorometerSensorObservation(input).save()
                observation._id = observation._id.toString()
                return observation
                },            
            

                createVelocitySensorObservation: async (_, {input}, { Robot, Sensor, Context, AccelorometerSensorObservation,VelocitySensorObservation,VelocitySensor2Observation,VelocitySensor3Observation,VelocitySensor4Observation }) => {
                const observation = await new VelocitySensorObservation(input).save()
                observation._id = observation._id.toString()
                return observation
                },            
            

                createVelocitySensor2Observation: async (_, {input}, { Robot, Sensor, Context, AccelorometerSensorObservation,VelocitySensorObservation,VelocitySensor2Observation,VelocitySensor3Observation,VelocitySensor4Observation }) => {
                const observation = await new VelocitySensor2Observation(input).save()
                observation._id = observation._id.toString()
                return observation
                },            
            

                createVelocitySensor3Observation: async (_, {input}, { Robot, Sensor, Context, AccelorometerSensorObservation,VelocitySensorObservation,VelocitySensor2Observation,VelocitySensor3Observation,VelocitySensor4Observation }) => {
                const observation = await new VelocitySensor3Observation(input).save()
                observation._id = observation._id.toString()
                return observation
                },            
            

                createVelocitySensor4Observation: async (_, {input}, { Robot, Sensor, Context, AccelorometerSensorObservation,VelocitySensorObservation,VelocitySensor2Observation,VelocitySensor3Observation,VelocitySensor4Observation }) => {
                const observation = await new VelocitySensor4Observation(input).save()
                observation._id = observation._id.toString()
                return observation
                },            
            
            }
        