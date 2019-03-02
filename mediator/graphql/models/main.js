
           const low = require('lowdb')
           const FileSync = require('lowdb/adapters/FileSync')
           const mediatorConfigAdapter = new FileSync('mediatorconfig.json');
           const mediatorConfig = low(mediatorConfigAdapter);
           import mongoose from 'mongoose'
           const Sequelize = require('sequelize');
           const dbConfigs = mediatorConfig.get('db').value();
           const entityDBMapping = mediatorConfig.get('entityDBMapping').value();
           // making mongodb connection pool
            let mongoDbConfigPool = makeConnectionPool(dbConfigs,"mongodb");
            // making mysql connection pool
            let mysqlConfigPool = makeConnectionPool(dbConfigs,"mysql");
        dbConfigs.forEach(dbConfig => {
            if (dbConfig.type == "mysql") {
                require("./mysql/context")(getConnection(mysqlConfigPool,dbConfig.name,"Context"),Sequelize);
            } else if (dbConfig.type == "mongodb") {
                require("./mongodb/context")(getConnection(mongoDbConfigPool,dbConfig.name,"Context"));
            }
        })
    // Context initialization - end
        
// Task initialization - start
const taskDbConfig = dbConfigs.find((dbConfig) => dbConfig.name === entityDBMapping.task);
const taskDb = taskDbConfig.type

let Task;

if (taskDb == "mongodb") {
    Task = require("./mongodb/task")(getConnection(mongoDbConfigPool,taskDbConfig.name,"Task"))
} else if (taskDb == "mysql") {
    Task = require("./mysql/task")(getConnection(mysqlConfigPool,taskDbConfig.name,"Task"),Sequelize,Context)
}
// Task initialization - end

// Robot initialization - start
const robotDbConfig = dbConfigs.find((dbConfig) => dbConfig.name === entityDBMapping.robot);
const robotDb = robotDbConfig.type
let Robot;
if (robotDb == "mongodb") {
    Robot = require("./mongodb/robot")(getConnection(mongoDbConfigPool,robotDbConfig.name,"Robot"))
} else if (robotDb == "mysql") {
    Robot = require("./mysql/robot")(getConnection(mysqlConfigPool,robotDbConfig.name,"Robot"),Sequelize,Context)
}
// Robot initialization - end

// Sensor initialization - start
const sensorDbConfig = dbConfigs.find((dbConfig) => dbConfig.name === entityDBMapping.sensor);
const sensorDb = sensorDbConfig.type
let Sensor;
if (sensorDb == "mongodb") {
    Sensor = require("./mongodb/sensor")(getConnection(mongoDbConfigPool,sensorDbConfig.name,"Sensor"))
} else if (sensorDb == "mysql") {
    Sensor = require("./mysql/sensor")(getConnection(mysqlConfigPool,sensorDbConfig.name,"Sensor"),Sequelize,Context)
}
// Sensor initialization - end

// TaskRobotSensor initialization - start
const taskrobotsensorDbConfig = dbConfigs.find((dbConfig) => dbConfig.name === entityDBMapping.taskrobotsensor);
const taskrobotsensorDb = taskrobotsensorDbConfig.type
let TaskRobotSensor;
if (taskrobotsensorDb == "mongodb") {
    TaskRobotSensor = require("./mongodb/task-robot-sensor")(getConnection(mongoDbConfigPool,taskrobotsensorDbConfig.name,"TaskRobotSensor"))
} else if (taskrobotsensorDb == "mysql") {
    TaskRobotSensor = require("./mysql/task-robot-sensor")(getConnection(mysqlConfigPool,taskrobotsensorDbConfig.name,"TaskRobotSensor"),Sequelize,Context)
}

        export {
            Task,
            Robot,
            Sensor,
            TaskRobotSensor,
        };


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

        function getConnection(connectionPool,dbName,entityName) {
            
            let poolIndex = connectionPool.findIndex(connection => {
                return connection.name === dbName
            });
            
            if (poolIndex > -1) {
                return connectionPool[poolIndex].connection;
            } else {
                console.log(`${entityName} DB config not found`);
                process.exit();
            }
        }