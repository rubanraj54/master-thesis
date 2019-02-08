const express = require('express')
const app = express()
const port = 3084
import { updateGraphQlSchema } from '../schema_registry/graphql-schema-updater'
import { updateGraphQlQuery } from '../schema_registry/graphql-query-updater'
import { updateGraphQlMutation } from '../schema_registry/graphql-mutation-updater'
const apiRequest = require('request');
const utility = require("../schema_registry/utils.js")
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('schema_registry.json')
const sr = low(adapter)
import { request } from 'graphql-request'

app.use(express.json());


if (!sr.has('robots').value()) {
    sr.set('robots', []).write()
}
if (!sr.has('sensors').value()) {
    sr.set('sensors', []).write()
}


function updateGraphQl(allSensors) {
    updateGraphQlSchema(allSensors);
    updateGraphQlQuery(allSensors);
    updateGraphQlMutation(allSensors);
    apiRequest('http://localhost:3085/restart', function (error, response, body) {});
}

app.post('/schemaregistry/', function (requestEndpoint, response) {
    let finalResponse = {
        robot: {
            name: "",
            id: ""
        },
        sensors: []
    };
    
    let data = requestEndpoint.body;
    let robot = data.robot;
    let robots = sr.get('robots').value();
    let robotIndexInRegistry = robots.findIndex(_robot => _robot.name === robot.name);
    if (robot && robotIndexInRegistry == -1) {
        let req = utility.registerRobot(data.robot, data.dbInfo)

        req.then(res => {
            let newRobot = {
                id: res._id,
                name: data.robot.name,
            }

            sr.get('robots').push(newRobot).write();
            finalResponse.robot.id = res._id;
            finalResponse.robot.name = data.robot.name;

            let existingSensors = sr.get('sensors').value();
            let sensorPromises = [];
            data.sensors.forEach(sensor => {
                let sensorIndexInRegistry = existingSensors.findIndex(existingSensor => existingSensor.name === sensor.name);
                if (sensorIndexInRegistry == -1) {
                    sensorPromises.push(utility.registerSensor(sensor, data.dbInfo));
                } else {
                    let existingSensor = existingSensors[sensorIndexInRegistry];
                    finalResponse.sensors.push({
                        id: existingSensor.id,
                        name: existingSensor.name
                    });
                    console.log(sensor.name, ' already exits');
                }
            });
            if (sensorPromises.length != 0) {
                Promise.all(sensorPromises).then(values => {
                    values.forEach(value => {
                        let newSensor = {
                            id: value._id,
                            name: value.name,
                        }
                        sr.get('sensors').push(newSensor).write();
                        finalResponse.sensors.push({
                            id: value._id,
                            name: value.name
                        });
                    });
                    const query = `{
                                        allSensors {
                                            _id,
                                            value_schema,
                                            name
                                        }
                                    }`

                    request('http://localhost:3085/graphql', query)
                        .then(data => {
                            updateGraphQl(data.allSensors);
                            response.json(finalResponse);
                        })
                        .catch(err => {
                            response.send("all Sensors failed")
                        })
                }).catch(err => {
                    console.log(err);
                    response.send("Sensor registry failed")
                });
            } else {
                response.json(finalResponse);
            }
        }).catch(err => {
            response.send("Robot registry failed")
            console.log(err);
        })
    } else if (robotIndexInRegistry > -1) {
        let existingRobot = robots[robotIndexInRegistry];
        finalResponse.robot.id = existingRobot.id;
        finalResponse.robot.name = existingRobot.name;
        let existingSensors = sr.get('sensors').value();
        let sensorPromises = [];
        data.sensors.forEach(sensor => {
            let sensorIndexInRegistry = existingSensors.findIndex(existingSensor => existingSensor.name === sensor.name);
            if (sensorIndexInRegistry == -1) {
                sensorPromises.push(utility.registerSensor(sensor, data.dbInfo));
            } else {
                let existingSensor = existingSensors[sensorIndexInRegistry];
                finalResponse.sensors.push({
                    id: existingSensor.id,
                    name: existingSensor.name
                });
                console.log(sensor.name, ' already exits');
            }
        });
        if (sensorPromises.length != 0) {
            Promise.all(sensorPromises).then(values => {
                // let existingSensors = sr.get('robots').find({ name: newRobot.name }).sensors
                values.forEach(value => {
                    let newSensor = {
                        id: value._id,
                        name: value.name,
                    }
                    sr.get('sensors').push(newSensor).write();
                    finalResponse.sensors.push({
                        id: value._id,
                        name: value.name
                    });
                });
                const query = `{
                                    allSensors {
                                        _id,
                                        value_schema,
                                        name
                                    }
                                }`

                request('http://localhost:3085/graphql', query)
                    .then(data => {
                        updateGraphQl(data.allSensors);
                        response.json(finalResponse);
                    })
                    .catch(err => {
                        response.send("all Sensors failed")
                    })
            }).catch(err => {
                console.log(err);
                response.send("Sensor registry failed")
            });
        } else {
            response.json(finalResponse);
        }
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))