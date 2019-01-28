var fs = require("fs");
var djvi = require("djvi");
var path = require('path');
var appDir = path.dirname(__dirname);

const forEach = require('lodash').forEach;


function updateGraphQlSchema() {

    let sensors = [{
            "_id": "5c4f3d15c746844cf310219c",
            "value_schema": {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "values": {
                        "type": "array",
                        "items": [{
                            "type": "object",
                            "properties": {
                                "x": {
                                    "type": "integer"
                                },
                                "y": {
                                    "type": "integer"
                                }
                            },
                            "required": [
                                "x",
                                "y"
                            ]
                        }]
                    }
                },
                "required": [
                    "values"
                ]
            },
            "name": "velocity_sensor"
        },
        {
            "_id": "5c4f3d3b02595e4dea91a578",
            "value_schema": {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "values": {
                        "type": "array",
                        "items": [{
                            "type": "object",
                            "properties": {
                                "x": {
                                    "type": "integer"
                                },
                                "y": {
                                    "type": "integer"
                                }
                            },
                            "required": [
                                "x",
                                "y"
                            ]
                        }]
                    }
                },
                "required": [
                    "values"
                ]
            },
            "name": "accelorometer_sensor"
        }
    ];


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
                        value: Input${observationName}Value
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
    var writeStream = fs.createWriteStream(appDir + "/mediator/graphqlschemas/" + 'test' + ".js");
    writeStream.write(`
                    export default \`
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

updateGraphQlSchema()