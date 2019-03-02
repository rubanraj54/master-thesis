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
        let folderPath = "";
        if (dbName == "mongodb") {
            folderPath = "/models/observations";
        } else if (dbName == "mysql") {
            folderPath = "/models/mysql/observations";
        }
        fs.readdir(appDir + folderPath, (err, files) => {
            let importStatements = "";
            let exportStatements = "";
            files.forEach(file => {
                let splitNames = file.replace(".js", "").split("-");
                let observationName = splitNames.map(function (name) {
                    return name.charAt(0).toUpperCase() + name.slice(1)
                }).join("");
                observationName += "Observation";
                let importStatement = "";
                // let importStatement = `import ${observationName} from '${filePath}${file}'`
                if (dbName == "mongodb") {
                    importStatement = `let ${observationName} = require("./observations/${file}").default`;
                } else if (dbName == "mysql") {
                    importStatement = `let ${observationName} = require("./mysql/observations/${file}")(sequelize,Sequelize,Context)`;
                }
                importStatements += "\n" + importStatement;
                exportStatements += "\n" + observationName + ",";
            });

            writeStream.write(`
            const Sequelize = require('sequelize');
            const sequelize = new Sequelize('${mysqlConnectionString}');
            // create tables in mysql if it doesn't exists in the database
            sequelize.sync()
            .then(() => {
                console.log("Database & tables created!")
            })
            const Context = require("./mysql/context")(sequelize,Sequelize); 
        ${taskImport}
        ${robotImport}
        ${sensorImport}
        ${taskRobotSensorImport}
        let MongoContext = require("./mongodb/context").default
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
        })
    }
}