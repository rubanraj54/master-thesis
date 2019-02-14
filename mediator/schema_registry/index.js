import { updateGraphQlSchema } from '../graphql/updaters/graphql-schema-updater'
import { updateGraphQlQuery } from '../graphql/updaters/graphql-query-updater'
import { updateGraphQlMutation } from '../graphql/updaters/graphql-mutation-updater'
import mongoose from 'mongoose'
import has from 'lodash/has'
import Task from "./models/task.js"
import Robot from "./models/robot.js"
import Sensor from "./models/sensor.js"
import TaskRobotSensor from "./models/task-robot-sensor.js"
import { createObservationModel } from '../graphql/updaters/observation-model-writer'
import { exportContexts } from '../graphql/updaters/context-exporter'

const express = require('express')
const app = express()
const port = 3084
const apiRequest = require('request');
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

function updateGraphQl(sensors) {
    updateGraphQlSchema(sensors);
    updateGraphQlQuery(sensors);
    updateGraphQlMutation(sensors);
    // apiRequest('http://localhost:3085/restart', function (error, response, body) {});
}

app.get('/test',async (requestEndpoint,response) => {

    // let data = requestEndpoint.body;
    let data = dummyData;
    // let data = dummyResuableData;
    
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
            let sensorIds = [];
            if (sensors && sensors.length > 0) {
                sensorIds = await registerSensors(sensors);
            }
            finalResponse.robots.push({
                _id: newRobotId,
                sensors: sensorIds.map(regSensorId => { return {_id:regSensorId}})
            });
            // robot-sensor registration
            await registerRobotSensors(task._id, newRobotId, sensorIds);
        }));
    }

    // update main.js which exports all contexts to graphql
    exportContexts();

    // get all sensors & update graphql component
    let sensors = await Sensor.find({});
    updateGraphQl(sensors);

    response.send(finalResponse);
})


async function registerSensors(sensors) {
    return await Promise.all(sensors.map(async _sensor => {
        if (!has(_sensor, '_id')) {
            _sensor.value_schema = JSON.parse(JSON.stringify(_sensor.value_schema).replace(/\$schema/g, "schema"));
            let newSensor = await Sensor(_sensor).save();
            createObservationModel(newSensor.name, newSensor.value_schema);
            return newSensor._id.toString();
        } else {
            return _sensor._id;
        }
    }));
}

async function registerRobotSensors(taskId, robotId, sensorIds) {
    return sensorIds.forEach(async regSensorId => {
        await TaskRobotSensor({
            task: taskId,
            robot: robotId,
            sensor: regSensorId,
            timestamp: new Date()
        }).save();
    })
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))