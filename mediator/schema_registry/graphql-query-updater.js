var fs = require("fs");
var path = require('path');
var appDir = path.dirname(__dirname);

module.exports = {
    updateGraphQlQuery(sensors) {
    
        let observationNames = [];
    
        sensors.forEach(sensor => {
            let observationName = sensor.name.split('_').map(function (sensorName) {
                return sensorName.charAt(0).toUpperCase() + sensorName.slice(1)
            }).join("");
            observationName += "Observation";
            observationNames.push(observationName);
        });
    
        let observationContexts = observationNames.join(',');
        console.log(observationContexts);
    
        let queries = [];
    
        observationNames.forEach(observationName => {
            let query = `
                all${observationName}s: async (parent, args, {Robot, Sensor,Context,${observationContexts}}) => {
                    const observations = await ${observationName}.find(args)
                    return observations.map(x => {
                        x._id = x._id.toString()
                        return x
                    })
                },            
            `;
            queries.push(query);
        });
    
        let finalQueries = queries.join('\n');
    
        let finalTemplate = `
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
            ${finalQueries}
            // getRobot: async (parent, args, { Robot, Sensor}) => {
            //   const robot = await Robot.findById(args.id)
            //   return robot
            // }
            }
        `;
        var writeStream = fs.createWriteStream(appDir + "/graphqlschemas/" + "newqueries.js");
        writeStream.write(finalTemplate);
        writeStream.end();
    }
}

