var fs = require("fs");
var djvi = require("djvi");
var path = require('path');
var appDir = path.dirname(__dirname);

const forEach = require('lodash').forEach;


module.exports = {
    updateGraphQlSchema(sensors) {
        let typesTemplate = [];
        let allQueries = [];
        let allMutations = [];
        sensors.forEach(sensor => {

            var env = new djvi();

            env.addSchema('test', sensor.value_schema);

            let model = env.instance('test#');
            let transformedValue = "";
            let value = (Array.isArray(model.values)) ? model.values[0] : model.values;
            let observationValue = "";

            forEach(value, (element, key) => {
                if (Array.isArray(element) || typeof element == "object") {
                    return false;
                }
                let type = "String";
                if (typeof element == "number" || typeof element == "integer") {
                    type = "Int";
                } else if (typeof element == "boolean") {
                    type = "Boolean";
                }
                observationValue += `${key}: ${type},` + "\n";
            })

            let names = sensor.name.split('_');

            let observationName = names.map(function (name) {
                return name.charAt(0).toUpperCase() + name.slice(1)
            }).join("");

            observationName += "Observation";
            
            let inputValueName = `Input${observationName}Value`;

            if (Array.isArray(model.values)) {
                inputValueName = "[" + inputValueName + "]"
            }

            // let observationName = generateObservationName(sensor.name);
            let typeValueName = (Array.isArray(model.values)) ? `[${observationName}Value]` : `${observationName}Value`
            let template = `
                            type ${observationName} {
                                _id: String
                                type: String
                                name: String
                                featureOfInterest: String
                                sensor: Sensor
                                robot: Robot
                                value: ${typeValueName}
                            }
                            
                            type ${observationName}Value {
                                ${observationValue}
                            }
                    
                            input Input${observationName} {
                                _id: String
                                type: String
                                name: String
                                featureOfInterest: String
                                sensor: String
                                robot: String
                                value: ${inputValueName}
                            }
                    
                            input Input${observationName}Value {
                                ${observationValue}
                    
                            }
                        `;
            typesTemplate.push(template);

            let query = `
                        all${observationName}s(
                            name: String
                        ): [${observationName}!] !,
                `;
            allQueries.push(query);

            let mutation = `
                        create${observationName}(
                            input: Input${observationName}!
                        ): ${observationName}!
                `;
            allMutations.push(mutation);
        });

        let templates = typesTemplate.join('\n');
        let queries = allQueries.join('\n');
        let mutations = allMutations.join('\n');
        // console.log(template);
        var writeStream = fs.createWriteStream(appDir + "/graphqlschemas/" + "newtypedef.js");
        writeStream.write(`
                            export default \`

                            scalar JSON

                            type Robot {
                                _id: String
                                type: String
                                name: String
                                mac_address: String,
                                context: Context
                            }

                            type Sensor {
                                _id: String
                                type: String
                                name: String
                                description: String
                                measures: String
                                unit: String
                                value_schema: JSON
                                meta: JSON
                                context: Context
                            }

                            type Context {
                                _id: String
                                name: String
                                value: JSON
                            }
                                ${templates}

                            type Query {

                                allRobots(
                                        name: String,
                                        mac_address: String,
                                    ): [Robot!] !,

                                    allSensors(
                                        name: String
                                    ): [Sensor!] !,

                                    allContexts(
                                        name: String
                                    ): [Context!] !,

                                    getRobot(
                                        id: String!
                                    ): Robot!

                                ${queries}
                            }

                            type Mutation {

                                createRobot(
                                        type: String!,
                                        name: String!,
                                        mac_address: String!,
                                        context: String!,
                                    ): Robot!

                                    createSensor(
                                        type: String!,
                                        name: String!,
                                        description: String!,
                                        measures: String!,
                                        value_schema: JSON!,
                                        unit: String!,
                                        meta: JSON!,
                                        context: String!,
                                    ): Sensor!

                                    createContext(
                                        name: String!
                                        value: JSON!,
                                    ): Context!
            
                                    ${mutations}
        }
        \`
                        `);

        writeStream.end();

// console.log(typesTemplate.join('\n'));

    }
}