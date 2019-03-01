var fs = require("fs");
var path = require('path');
var appDir = path.dirname(__dirname);
import {
    generateObservationName,
} from "../general/utils"

module.exports = {
    updateGraphQlMutation(sensors) {
        let observationNames = [];
        sensors.forEach(sensor => {
            observationNames.push(generateObservationName(sensor.name));
        });

        let observationContexts = observationNames.join(',');

        let mutations = [];

        observationNames.forEach(observationName => {
            let mutation = `
                create${observationName}: async (_, {input}, { Robot, Sensor, Context, ${observationContexts} }) => {
                const observation = await new ${observationName}(input).save()
                observation._id = observation._id.toString()
                return observation
                },            
            `;
            mutations.push(mutation);
        });

        let finalMutations = mutations.join('\n');

        let finalTemplate = `
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
                ${finalMutations}
            }
        `;
        var writeStream = fs.createWriteStream(appDir + "/graphqlschemas/" + "newmutations.js");
        writeStream.write(finalTemplate);
        writeStream.end();
    }
}

