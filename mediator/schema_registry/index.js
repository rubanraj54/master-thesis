import { updateGraphQlSchema } from '../graphql/updaters/graphql-schema-updater'
import { updateGraphQlQuery } from '../graphql/updaters/graphql-query-updater'
import { updateGraphQlMutation } from '../graphql/updaters/graphql-mutation-updater'
import mongoose from 'mongoose'
import has from 'lodash/has'
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const mediatorConfigAdapter = new FileSync('mediatorconfig.json');
const mediatorConfig = low(mediatorConfigAdapter);

const dbConfigs = mediatorConfig.get('db').value();
const entityDBMapping = mediatorConfig.get('entityDBMapping').value();

const Sequelize = require('sequelize');

// making mongodb connection pool
let mongoDbConfigPool = makeConnectionPool(dbConfigs,"mongodb");

// making mysql connection pool
let mysqlConfigPool = makeConnectionPool(dbConfigs,"mysql");

// const Context = require("./models/mysql/context")(sequelize,Sequelize);

// Task initialization - start
const taskDbConfig = dbConfigs.find((dbConfig) => dbConfig.name === entityDBMapping.task);
const taskDb = taskDbConfig.type
let Task;

if (taskDb == "mongodb") {
    Task = require("./models/mongodb/task")(getConnection(mongoDbConfigPool,taskDbConfig.name,"Task"))
} else if (taskDb == "mysql") {
    Task = require("./models/mysql/task")(getConnection(mysqlConfigPool,taskDbConfig.name,"Task"),Sequelize,Context)
}
// Task initialization - end

// Robot initialization - start
const robotDbConfig = dbConfigs.find((dbConfig) => dbConfig.name === entityDBMapping.robot);
const robotDb = robotDbConfig.type
let Robot;
if (robotDb == "mongodb") {
    Robot = require("./models/mongodb/robot")(getConnection(mongoDbConfigPool,robotDbConfig.name,"Robot"))
} else if (robotDb == "mysql") {
    Robot = require("./models/mysql/robot")(getConnection(mysqlConfigPool,robotDbConfig.name,"Robot"),Sequelize,Context)
}
// Robot initialization - end

// Sensor initialization - start
const sensorDbConfig = dbConfigs.find((dbConfig) => dbConfig.name === entityDBMapping.sensor);
const sensorDb = sensorDbConfig.type
let Sensor;
if (sensorDb == "mongodb") {
    Sensor = require("./models/mongodb/sensor")(getConnection(mongoDbConfigPool,sensorDbConfig.name,"Sensor"))
} else if (sensorDb == "mysql") {
    Sensor = require("./models/mysql/sensor")(getConnection(mysqlConfigPool,sensorDbConfig.name,"Sensor"),Sequelize,Context)
}
// Sensor initialization - end

// TaskRobotSensor initialization - start
const taskrobotsensorDbConfig = dbConfigs.find((dbConfig) => dbConfig.name === entityDBMapping.taskrobotsensor);
const taskrobotsensorDb = taskrobotsensorDbConfig.type
let TaskRobotSensor;
if (taskrobotsensorDb == "mongodb") {
    TaskRobotSensor = require("./models/mongodb/task-robot-sensor")(getConnection(mongoDbConfigPool,taskrobotsensorDbConfig.name,"TaskRobotSensor"))
} else if (taskrobotsensorDb == "mysql") {
    TaskRobotSensor = require("./models/mysql/task-robot-sensor")(getConnection(mysqlConfigPool,taskrobotsensorDbConfig.name,"TaskRobotSensor"),Sequelize,Context)
}
// TaskRobotSensor initialization - end

import { createObservationModel } from '../graphql/updaters/observation-model-writer'
import { createMysqlObservationModel } from '../graphql/updaters/mysql-observation-model-writer'
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

// create tables in mysql if it doesn't exists in the database
mysqlConfigPool.forEach(mysqlConnection => {
    mysqlConnection.connection.sync()
      .then(() => {
        console.log(`${mysqlConnection.name} - Database & tables created!`)
    })
});

function makeMongoDBConnection(mongoDb) {
    let hostWithCredentials = "";
    if (mongoDb.userName == "" && mongoDb.password == "") {
        hostWithCredentials = mongoDb.url;
    } else if (mongoDb.userName == "") {
        hostWithCredentials = `:${mongoDb.password}@${mongoDb.url}`;;
    } else if (mongoDb.password == "") {
        hostWithCredentials = `${mongoDb.userName}:@${mongoDb.url}`;
    }
    return mongoose.createConnection(`mongodb://${hostWithCredentials}/${mongoDb.dbName}`, {
        useNewUrlParser: true
    });
}
function makeMysqlConnection(mysql) {
    let hostWithCredentials = "";
    if (mysql.userName == "" && mysql.password == "") {
        hostWithCredentials = mysql.url;
    } else if (mysql.userName == "") {
        hostWithCredentials = `:${mysql.password}@${mysql.url}`;;
    } else if (mysql.password == "") {
        hostWithCredentials = `${mysql.userName}:@${mysql.url}`;
    } else {
        hostWithCredentials = `${mysql.userName}:${mysql.password}@${mysql.url}`;
    }
    return new Sequelize(`mysql://${hostWithCredentials}/${mysql.dbName}`);
}

function getConnection(connectionPool,dbName,entityName) {
    let poolIndex = connectionPool.findIndex(connection => connection.name === dbName);
    if (poolIndex > -1) {
        return connectionPool[poolIndex].connection;
    } else {
        console.log(`${entityName} DB config not found`);
        process.exit();
    }
}

app.use(express.json());

sr.defaults({ robots: [], sensors: [] }).write()

function updateGraphQl(sensors) {
    updateGraphQlSchema(sensors);
    updateGraphQlQuery(sensors);
    updateGraphQlMutation(sensors);
    apiRequest('http://graphql:3085/restart', function (error, response, body) {});
}

app.get('/schema-registry',async (requestEndpoint,response) => {

    // let data = requestEndpoint.body;
    let data = dummyData;
    // let data = dummyResuableData;
    
    let newSensorNames = data.robots.reduce((accumulator,currentValue) => {
        return accumulator.concat(currentValue.sensors.map(sensor => sensor.name.toLowerCase()));
    },[]);

    let existingSensorNames = sr.get('sensors').value().map(sensor => sensor.name.toLowerCase());

    // Duplicate sensor name test rule
    let ruleOne = (new Set(newSensorNames)).size !== newSensorNames.length;
    let ruleTwo = false; 

    newSensorNames.some(newSensorName => {
        if (existingSensorNames.includes(newSensorName.toLowerCase())) {
            ruleTwo = true;
            return true; // this will break the loop once found
        }
    });

    if (ruleOne || ruleTwo) {
        response.send("Duplicate sensor name found");
        return;
    }

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
    let sensors = [];
    if (sensorDb == "mongodb") {
        sensors = await Sensor.find({});
    } else if (sensorDb == "mysql") {
        sensors = await Sensor.findAll({
            raw: true,
            nest: true
        });
    }   

    updateGraphQl(sensors);

    response.send(finalResponse);
})

app.get('/reset', async (requestEndpoint,response) => {
    
    if (taskDb == "mongodb") { 
        await Task.remove({});
    } else if (taskDb == "mysql") {
        await Task.destroy({
            where: {},
            truncate: { cascade: true }
          });
    }

    if (robotDb == "mongodb") { 
        await Robot.remove({});
    } else if (robotDb == "mysql") {
        await Robot.destroy({
            where: {},
            truncate: { cascade: true }
          });
    }

    if (sensorDb == "mongodb") { 
        await Sensor.remove({});
    } else if (sensorDb == "mysql") {
        await Sensor.destroy({
            where: {},
            truncate: { cascade: true }
          });
    }

    if (taskrobotsensorDb == "mongodb") { 
        await TaskRobotSensor.remove({});
    } else if (taskrobotsensorDb == "mysql") {
        await TaskRobotSensor.destroy({
            where: {},
            truncate: { cascade: true }
          });
    }

    deleteObservations('../graphql/models/observations')
    deleteObservations('../graphql/models/mysql/observations')

    sr.get('sensors').remove({}).write();
        
    // update main.js which exports all contexts to graphql
    exportContexts();

    // get all sensors & update graphql component
    let sensors = [];
    if (sensorDb == "mongodb") {
        sensors = await Sensor.find({});
    } else if (sensorDb == "mysql") {
        sensors = await Sensor.findAll({
            raw: true,
            nest: true
        });
    } 
    updateGraphQl(sensors);

    response.send('success');
});


function deleteObservations(dirPath) {
    if (!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath);
    }
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
}

function makeConnectionPool(dbConfigs,dbName) {
    let connectionPool = [];
    dbConfigs.forEach(dbConfig => {
        if (dbConfig.type != dbName) return;
        let connection = null;
        if (dbName == "mysql") {
            connection = makeMysqlConnection(dbConfig);
        } else if (dbName == "mongodb") {
            connection = makeMongoDBConnection(dbConfig);
        }
        connectionPool.push({
            name: dbConfig.name,
            connection 
        });
    });
    return connectionPool;
}
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

            sr.get('sensors').push({ _id: newSensor._id, name: newSensor.name}).write();
            
            createObservationModel(newSensor.name, newSensor.value_schema);
            createMysqlObservationModel(newSensor.name, newSensor.value_schema);
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
                task: taskId,
                robot: robotId,
                sensor: regSensorId,
                timestamp: new Date()
            });
        }
    })
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))