var fs = require("fs");
const forEach = require('lodash').forEach;
var path = require('path');
var appDir = path.dirname(__dirname);

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const mediatorConfigAdapter = new FileSync('mediatorconfig.json');
const mediatorConfig = low(mediatorConfigAdapter);
const dbConfigs = mediatorConfig.get('db').value();

//checking for mongodb configuration and making connection
let mysqlIndex = dbConfigs.findIndex(database => database.name === "mysql");
let mysqlConnectionString = "";
if (mysqlIndex != -1) {
    let mysql = dbConfigs[mysqlIndex];
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
    mysqlConnectionString = `mysql://${hostWithCredentials}/${mysql.dbName}`;
} else {
    console.log("mongodb configuration missing");
}

// Task initialization - start
const taskDbConfig = dbConfigs.find((dbConfig) => dbConfig.entities.findIndex((entity) => entity === "task") > -1);
const taskDb = taskDbConfig.name
let taskImport = "";
if (taskDb == "mongodb") {
    taskImport = 'let Task = require("./mongodb/task").default';
} else if (taskDb == "mysql") {
    taskImport = 'let Task = require("./mysql/task")(sequelize,Sequelize,Context)';
}
// Task initialization - end

// Robot initialization - start
const robotDbConfig = dbConfigs.find((dbConfig) => dbConfig.entities.findIndex((entity) => entity === "robot") > -1);
const robotDb = robotDbConfig.name
let robotImport;
if (robotDb == "mongodb") {
    robotImport = 'let Robot = require("./mongodb/robot").default';
} else if (robotDb == "mysql") {
    robotImport = 'let Robot = require("./mysql/robot")(sequelize,Sequelize,Context)';
}
// Robot initialization - end

// Sensor initialization - start
const sensorDbConfig = dbConfigs.find((dbConfig) => dbConfig.entities.findIndex((entity) => entity === "sensor") > -1);
const sensorDb = sensorDbConfig.name
let sensorImport;
if (sensorDb == "mongodb") {
    sensorImport = 'let Sensor = require("./mongodb/sensor").default';
} else if (sensorDb == "mysql") {
    sensorImport = 'let Sensor = require("./mysql/sensor")(sequelize,Sequelize,Context)';
}
// Sensor initialization - end

// TaskRobotSensor initialization - start
const taskrobotsensorDbConfig = dbConfigs.find((dbConfig) => dbConfig.entities.findIndex((entity) => entity === "taskrobotsensor") > -1);
const taskrobotsensorDb = taskrobotsensorDbConfig.name
let taskRobotSensorImport;
if (taskrobotsensorDb == "mongodb") {
    taskRobotSensorImport = 'let TaskRobotSensor = require("./mongodb/task-robot-sensor").default';
} else if (taskrobotsensorDb == "mysql") {
    taskRobotSensorImport = 'let TaskRobotSensor = require("./mysql/task-robot-sensor")(sequelize,Sequelize)';
}
// TaskRobotSensor initialization - end

const observationDbConfig = dbConfigs.find((dbConfig) => dbConfig.entities.findIndex((entity) => entity === "observation") > -1);
const observationDb = observationDbConfig.name

module.exports = {
    exportContexts(dbName) {
        var writeStream = fs.createWriteStream(appDir + "/models/main.js");
        
        let folderPath = "/models/mysql/observations";
        let importStatements = "";
        let exportStatements = "";
        let observationStatements = "";
        let mysqlObservationStatements = "";
        let mongodbObservationStatements = "";
        let bucketsStatements = "";
        fs.readdir(appDir + folderPath, (err, files) => {
            file = file.replace(".js", "");
            let splitNames = file.split("-");
            let observationName = splitNames.map(function (name) {
                return name.charAt(0).toUpperCase() + name.slice(1)
            }).join("");
            observationName += "Observation";
            let importStatement = `
                const MySql${observationName} = require("./mysql/observations/${file}");
                const Mongo${observationName} = require("./observations/${file}");
                let ${observationName}Buckets = [];
            `;
            observationStatements += "\n let " + observationName + " = null"; 
            mysqlObservationStatements += "\n" + observationName + `" = MySql${observationName}(getConnection(mysqlConfigPool, dbConfig.name, "Mysql${observationName}"), Sequelize);"; `
            mongodbObservationStatements += "\n" + observationName + `" = Mongo${observationName}(getConnection(mysqlConfigPool, dbConfig.name, "Mongo${observationName}"));"; `
            bucketsStatements += "\n" + `
                ${observationName}Buckets.push({
                    type: dbConfig.type,
                    observation : ${observationName}
                });
            ` + "\n";
            importStatements += "\n" + importStatement;
            exportStatements += "\n" + observationName + "Buckets,";
        });

        importStatements += "\n" + `
        entityDBMapping.observations.forEach(_observation => {
            let dbConfig = dbConfigs.find(dbConfig => dbConfig.name === _observation);
            if (dbConfig == undefined) {
                console.log(_observation + " DB config not found");
                return;
            }
        
            ${observationStatements}
        
            if (dbConfig.type == "mysql") {
                ${mysqlObservationStatements}
            } else if (dbConfig.type == "mongodb") {
                ${mongodbObservationStatements}
            }
        
            ${bucketsStatements}
        
        });`;        
        


        writeStream.write(`
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

            ${importStatements}

            const Sequelize = require('sequelize');
            const sequelize = new Sequelize('${mysqlConnectionString}');
            // create tables in mysql if it doesn't exists in the database
            // sequelize.sync()
            // .then(() => {
            //     console.log("Database & tables created!")
            // })
            const Context = require("./mysql/context")(sequelize,Sequelize); 
            let MongoContext = require("./mongodb/context").default

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

        
            ${importStatements}
        export {
            Task,
            Robot,
            Sensor,
            MongoContext,
            Context,
            TaskRobotSensor,
            ${exportStatements}
        };

        `);

        writeStream.end();
    }
}