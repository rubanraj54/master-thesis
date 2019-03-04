import {
    makeConnectionPool,
    getConnection
} from "../general/utils"
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const mediatorConfigAdapter = new FileSync('mediatorconfig.json');
const mediatorConfig = low(mediatorConfigAdapter);
const Sequelize = require('sequelize');
const dbConfigs = mediatorConfig.get('db').value();
const entityDBMapping = mediatorConfig.get('entityDBMapping').value();
// making mongodb connection pool
let mongoDbConfigPool = makeConnectionPool(dbConfigs, "mongodb");
// making mysql connection pool
let mysqlConfigPool = makeConnectionPool(dbConfigs, "mysql");


// Context initialization - start
dbConfigs.forEach(dbConfig => {
    if (dbConfig.type == "mysql") {
        require("./mysql/context")(getConnection(mysqlConfigPool, dbConfig.name, "Context"), Sequelize);
    } else if (dbConfig.type == "mongodb") {
        require("./mongodb/context")(getConnection(mongoDbConfigPool, dbConfig.name, "Context"));
    }
})
// Context initialization - end

let CommandVelocityObservationBuckets = [];
let JointStatesObservationBuckets = [];
let OdometerObservationBuckets = [];
let ScanFrontObservationBuckets = [];

// let observationFiles = ['command-velocity','joint-states','odometer','scan-front'];
const MySqlCommandVelocityObservation = require("./mysql/observations/command-velocity");
const MongoCommandVelocityObservation = require("./observations/command-velocity");


entityDBMapping.observations.forEach(_observation => {
    let dbConfig = dbConfigs.find(dbConfig => dbConfig.name === _observation);
    if (dbConfig == undefined) {
        console.log(`${_observation} DB config not found`);
        return;
    }

    let observation = null;

    if (dbConfig.type == "mysql") {
        observation = MySqlCommandVelocityObservation(getConnection(mysqlConfigPool, dbConfig.name, "MysqlCommandVelocityObservation"), Sequelize);
    } else if (dbConfig.type == "mongodb") {
        observation = MongoCommandVelocityObservation(getConnection(mongoDbConfigPool, dbConfig.name, "MongoCommandVelocityObservation"));
    }

    CommandVelocityObservationBuckets.push({
        type: dbConfig.type,
        observation
    });

    JointStatesObservationBuckets.push({
        type: dbConfig.type,
        observation
    });

    OdometerObservationBuckets.push({
        type: dbConfig.type,
        observation
    });

    ScanFrontObservationBuckets.push({
        type: dbConfig.type,
        observation
    });

});

// Task initialization - start
const taskDbConfig = dbConfigs.find((dbConfig) => dbConfig.name === entityDBMapping.task);
const taskDb = taskDbConfig.type

let Task;

if (taskDb == "mongodb") {
    Task = require("./mongodb/task")(getConnection(mongoDbConfigPool, taskDbConfig.name, "Task"))
} else if (taskDb == "mysql") {
    Task = require("./mysql/task")(getConnection(mysqlConfigPool, taskDbConfig.name, "Task"), Sequelize, Context)
}
// Task initialization - end

// Robot initialization - start
const robotDbConfig = dbConfigs.find((dbConfig) => dbConfig.name === entityDBMapping.robot);
const robotDb = robotDbConfig.type
let Robot;
if (robotDb == "mongodb") {
    Robot = require("./mongodb/robot")(getConnection(mongoDbConfigPool, robotDbConfig.name, "Robot"))
} else if (robotDb == "mysql") {
    Robot = require("./mysql/robot")(getConnection(mysqlConfigPool, robotDbConfig.name, "Robot"), Sequelize, Context)
}
// Robot initialization - end

// Sensor initialization - start
const sensorDbConfig = dbConfigs.find((dbConfig) => dbConfig.name === entityDBMapping.sensor);
const sensorDb = sensorDbConfig.type
let Sensor;
if (sensorDb == "mongodb") {
    Sensor = require("./mongodb/sensor")(getConnection(mongoDbConfigPool, sensorDbConfig.name, "Sensor"))
} else if (sensorDb == "mysql") {
    Sensor = require("./mysql/sensor")(getConnection(mysqlConfigPool, sensorDbConfig.name, "Sensor"), Sequelize, Context)
}
// Sensor initialization - end

// TaskRobotSensor initialization - start
const taskrobotsensorDbConfig = dbConfigs.find((dbConfig) => dbConfig.name === entityDBMapping.taskrobotsensor);
const taskrobotsensorDb = taskrobotsensorDbConfig.type
let TaskRobotSensor;
if (taskrobotsensorDb == "mongodb") {
    TaskRobotSensor = require("./mongodb/task-robot-sensor")(getConnection(mongoDbConfigPool, taskrobotsensorDbConfig.name, "TaskRobotSensor"))
} else if (taskrobotsensorDb == "mysql") {
    TaskRobotSensor = require("./mysql/task-robot-sensor")(getConnection(mysqlConfigPool, taskrobotsensorDbConfig.name, "TaskRobotSensor"), Sequelize, Context)
}

export {
    Task,
    Robot,
    Sensor,
    TaskRobotSensor,
    CommandVelocityObservationBuckets
};