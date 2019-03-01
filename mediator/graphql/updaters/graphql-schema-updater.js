var fs = require("fs");
var djvi = require("djvi");
var path = require('path');
var appDir = path.dirname(__dirname);

const forEach = require('lodash').forEach;
import {
    generateObservationName,
} from "../general/utils"

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
            let value = (Array.isArray(model)) ? model[0] : model;
            let observationValue = "";
            
            forEach(value, (element, key) => {
                let isValidArray = false;
                if (!Array.isArray(element) && typeof element == "object") {
                    return;
                }
                if (Array.isArray(element) && typeof element[0] == "object") {
                    return;
                } else if(Array.isArray(element)){
                    element = element[0];
                    isValidArray = true;
                }

                let type = "String";
                
                if (typeof element == "number" || typeof element == "integer") {
                    type = "Float";
                } else if (typeof element == "boolean") {
                    type = "Boolean";
                }

                type = (isValidArray) ? `[${type}]` : type;

                observationValue += `${key}: ${type},` + "\n";
            })

            let observationName = generateObservationName(sensor.name);
            
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
                                task: Task
                                phenomenonTime: DateTime
                                resultTime: DateTime
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
                                task: String
                                phenomenonTime: DateTime
                                resultTime: DateTime
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
                            featureOfInterest: String
                            sensor: String
                            robot: String
                            task: String
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
        var writeStream = fs.createWriteStream(appDir + "/graphqlschemas/" + "newtypedef.js");
        writeStream.write(`
                            export default \`

                            scalar JSON
                            scalar DateTime

                            type Task {
                                _id: String
                                name: String
                                context: Context
                                robots: [Robot]
                                sensors: [Sensor]
                            }

                            type Robot {
                                _id: String
                                type: String
                                name: String
                                mac_address: String,
                                context: Context
                                sensors: [Sensor]
                                tasks: [Task]
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
                                robots: [Robot]
                                tasks: [Task]
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

                                    allTasks(
                                        name: String
                                    ): [Task!] !,

                                    allContexts(
                                        name: String
                                    ): [Context!] !,

                                    getRobot(
                                        _id: String!
                                        name: String
                                    ): Robot

                                    getSensor(
                                        _id: String!
                                        name: String
                                    ): Sensor

                                    getTask(
                                        _id: String!
                                        name: String
                                    ): Task

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