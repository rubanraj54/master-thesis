
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
                
            }
        