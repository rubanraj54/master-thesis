import { updateGraphQlSchema } from '../graphql/updaters/graphql-schema-updater'
import { updateGraphQlQuery } from '../graphql/updaters/graphql-query-updater'
import { updateGraphQlMutation } from '../graphql/updaters/graphql-mutation-updater'
import mongoose from 'mongoose'
import has from 'lodash/has'
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:password@localhost:3308/db');
const Context = require("./models/mysql/context")(sequelize,Sequelize);

const mediatorConfigAdapter = new FileSync('mediatorconfig.json');
const mediatorConfig = low(mediatorConfigAdapter);

const dbConfigs = mediatorConfig.get('db').value();

// Task initialization - start
const taskDbConfig = dbConfigs.find((dbConfig) => dbConfig.entities.findIndex((entity) => entity === "task") > -1);
const taskDb = taskDbConfig.name
let Task;
if (taskDb == "mongodb") {
    Task = require("./models/mongodb/task").default
} else if (taskDb == "mysql") {
    Task = require("./models/mysql/task")(sequelize,Sequelize,Context)
}
// Task initialization - end

// Robot initialization - start
const robotDbConfig = dbConfigs.find((dbConfig) => dbConfig.entities.findIndex((entity) => entity === "robot") > -1);
const robotDb = robotDbConfig.name
let Robot;
if (robotDb == "mongodb") {
    Robot = require("./models/mongodb/robot").default
} else if (robotDb == "mysql") {
    Robot = require("./models/mysql/robot")(sequelize,Sequelize,Context)
}
// Robot initialization - end

// Sensor initialization - start
const sensorDbConfig = dbConfigs.find((dbConfig) => dbConfig.entities.findIndex((entity) => entity === "sensor") > -1);
const sensorDb = sensorDbConfig.name
let Sensor;
if (sensorDb == "mongodb") {
    Sensor = require("./models/mongodb/sensor").default
} else if (sensorDb == "mysql") {
    Sensor = require("./models/mysql/sensor")(sequelize,Sequelize,Context)
}
// Sensor initialization - end

// TaskRobotSensor initialization - start
const taskrobotsensorDbConfig = dbConfigs.find((dbConfig) => dbConfig.entities.findIndex((entity) => entity === "taskrobotsensor") > -1);
const taskrobotsensorDb = taskrobotsensorDbConfig.name
let TaskRobotSensor;
if (taskrobotsensorDb == "mongodb") {
    TaskRobotSensor = require("./models/mongodb/task-robot-sensor").default
} else if (taskrobotsensorDb == "mysql") {
    TaskRobotSensor = require("./models/mysql/task-robot-sensor")(sequelize,Sequelize)
}
// TaskRobotSensor initialization - end

import { createObservationModel } from '../graphql/updaters/observation-model-writer'
import { exportContexts } from '../graphql/updaters/context-exporter'

const express = require('express')
const app = express()
const port = 3084
const apiRequest = require('request');
const adapter = new FileSync('schema_registry.json')
const sr = low(adapter)
const dummyData = require('./toy_data/test.json'); 
const dummyResuableData = require('./toy_data/resuable_test.json'); 

const fs = require('fs');

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
    apiRequest('http://localhost:3085/restart', function (error, response, body) {});
}

app.get('/schema-registry',async (requestEndpoint,response) => {

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
    let task;
    if (taskDb == "mongodb") {
        task = await Task(taskInfo).save();
    } else if (taskDb == "mysql") {
        task = await Task.create(taskInfo);
    }    

    finalResponse.task._id = task._id;

    // creating all robots and sensors
    let robots = data.robots;
    if(robots && robots.length > 0) {
        await Promise.all(robots.map(async _robot => {
            let newRobotId = "";
            if (!has(_robot, '_id')) {
                if (robotDb == "mongodb") {
                    newRobotId = (await Robot(_robot).save())._id;
                } else if (robotDb == "mysql") {
                    newRobotId = (await Robot.create(_robot))._id;
                }
            } else {
                newRobotId = _robot._id; 
            }

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
    // updateGraphQl(sensors);

    response.send(finalResponse);
})

app.get('/reset', async (requestEndpoint,response) => {
    
    if (taskDb == "mongodb") { 
        await Task.remove({});
    }

    if (robotDb == "mongodb") { 
        await Robot.remove({});
    }

    if (sensorDb == "mongodb") { 
        await Sensor.remove({});
    }

    if (taskrobotsensorDb == "mongodb") { 
        await TaskRobotSensor.remove({});
    }

    const dirPath = "../graphql/models/observations";
    try { var files = fs.readdirSync(dirPath); }
    catch(e) { return; }
    console.log(files);
    
    // delete the observation model files from graphql model folder
    if (files.length > 0) {
        for (var i = 0; i < files.length; i++) {
          var filePath = dirPath + '/' + files[i];
          if (fs.statSync(filePath).isFile()) {
              fs.unlinkSync(filePath);
          }
          else {
              rmDir(filePath);
          }
        }
    }
        
    // update main.js which exports all contexts to graphql
    exportContexts();

    // get all sensors & update graphql component
    let sensors = await Sensor.find({});
    updateGraphQl(sensors);

    response.send('success');
});


async function registerSensors(sensors) {
    return await Promise.all(sensors.map(async _sensor => {
        if (!has(_sensor, '_id')) {
            _sensor.value_schema = JSON.parse(JSON.stringify(_sensor.value_schema).replace(/\$schema/g, "schema"));
            let newSensor;
            if (sensorDb == "mongodb") {
                newSensor = await Sensor(_sensor).save();
            } else if (sensorDb == "mysql") {
                newSensor = await Sensor.create(_sensor);
            }
            createObservationModel(newSensor.name, newSensor.value_schema);
            return newSensor._id.toString();
        } else {
            return _sensor._id;
        }
    }));
}

async function registerRobotSensors(taskId, robotId, sensorIds) {
    return sensorIds.forEach(async regSensorId => {
        if (taskrobotsensorDb == "mongodb") {
            await TaskRobotSensor({
                task: taskId,
                robot: robotId,
                sensor: regSensorId,
                timestamp: new Date()
            }).save();
        } else if (taskrobotsensorDb == "mysql") {
            await TaskRobotSensor.create({
                taskId: taskId,
                robotId: robotId,
                sensorId: regSensorId,
                timestamp: new Date()
            });
        }
    })
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))