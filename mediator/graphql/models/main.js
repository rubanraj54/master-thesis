
            const Sequelize = require('sequelize');
            const sequelize = new Sequelize('mysql://root:password@localhost:3308/db');
            const Context = require("./mysql/context")(sequelize,Sequelize); 
        let Task = require("./mysql/task")(sequelize,Sequelize,Context)
        let Robot = require("./mongodb/robot").default
        let Sensor = require("./mysql/sensor")(sequelize,Sequelize,Context)
        let TaskRobotSensor = require("./mysql/task-robot-sensor")(sequelize,Sequelize)
        let MongoContext = require("./mongodb/context").default
            
        export {
            Task,
            Robot,
            Sensor,
            MongoContext,
            Context,
            TaskRobotSensor,
            
        };

            