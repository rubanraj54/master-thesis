import { updateGraphQlSchema } from '../schema_registry/graphql-schema-updater'
import { updateGraphQlQuery } from '../schema_registry/graphql-query-updater'
import { updateGraphQlMutation } from '../schema_registry/graphql-mutation-updater'
import { request } from 'graphql-request'
import mongoose from 'mongoose'
import has from 'lodash/has'
import Task from "./models/task.js"
import Robot from "./models/robot.js"
import Sensor from "./models/sensor.js"
import RobotSensor from "./models/robot-sensor.js"

const express = require('express')
const app = express()
const port = 3084
const apiRequest = require('request');
const utility = require("../schema_registry/utils.js")
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('schema_registry.json')
const sr = low(adapter)
const dummyData = require('./toy_data/test.json'); 
const dummyResuableData = require('./toy_data/resuable_test.json'); 
const mediatorConfigAdapter = new FileSync('../mediatorconfig.json')
const mediatorConfig = low(mediatorConfigAdapter)

//checking for mongodb configuration and making connection
let databases = mediatorConfig.get('db').value();
let mongoDbIndex = databases.findIndex(database => database.name === "mongodb");
if (mongoDbIndex != -1) {
    let mongoDb = databases[mongoDbIndex];
    let hostWithCredentials = "";
    if (mongoDb.userName == "" && mongoDb.password == "") {
        hostWithCredentials = mongoDb.url;
    } else if (mongoDb.userName == "") {
        hostWithCredentials = `:${mongoDb.password}@${mongoDb.url}`;;
    } else if (mongoDb.password == "") {
        hostWithCredentials = `${mongoDb.userName}:@${mongoDb.url}`;
    }
    mongoose.connect(`mongodb://${hostWithCredentials}/${mongoDb.dbName}`, {
        useNewUrlParser: true
    });
} else {
    console.log("mongodb configuration missing");
}


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

app.get('/test',async (requestEndpoint,response) => {

    // let data = requestEndpoint.body;
    // let data = dummyData;
    let data = dummyResuableData;
    
    let finalResponse = {
        task: {
            _id: ""
        },
        robots:[]
    }
    
    // creating test record (context field is mandatory)
    let taskInfo = data.task;
    let task = await Task(taskInfo).save();
    finalResponse.task._id = task._id;

    // creating all robots and sensors
    let robots = data.robots;
    if(robots && robots.length > 0) {
        await Promise.all(robots.map(async _robot => {
            let newRobotId = has(_robot, '_id') ? _robot._id :(await Robot(_robot).save())._id;

            // sensor registration
            let sensors = _robot.sensors;
            let regSensorIds = [];
            if (sensors && sensors.length > 0) {
                regSensorIds = await registerSensors(sensors);
            }
            finalResponse.robots.push({
                _id: newRobotId,
                sensors: regSensorIds.map(regSensorId => { return {_id:regSensorId}})
            });
            // robot-sensor registration
            await registerRobotSensors(newRobotId, regSensorIds);
        }));
    }
    response.send(finalResponse);
})


async function registerSensors(sensors) {
    return await Promise.all(sensors.map(async _sensor => {
        if (!has(_sensor, '_id')) {
            _sensor.value_schema = JSON.parse(JSON.stringify(_sensor.value_schema).replace(/\$schema/g, "schema"));
            let newSensor = await Sensor(_sensor).save();
            return newSensor._id.toString();
        } else {
            return _sensor._id;
        }
    }));
}

async function registerRobotSensors(newRobotId, regSensorIds) {
    return regSensorIds.forEach(async regSensorId => {
        await RobotSensor({
            robot: newRobotId,
            sensor: regSensorId,
            timestamp: new Date()
        }).save();
    })
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