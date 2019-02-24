
            const Sequelize = require('sequelize');
            const sequelize = new Sequelize('mysql://root:password@localhost:3308/db');
            const Context = require("./mysql/context")(sequelize,Sequelize); 
        let Task = require("./mongodb/task").default
        let Robot = require("./mongodb/robot").default
        let Sensor = require("./mongodb/sensor").default
        let TaskRobotSensor = require("./mongodb/task-robot-sensor").default
        let MongoContext = require("./mongodb/context").default
            
        export {
            Task,
            Robot,
            Sensor,
            MongoContext,
            Context,
            TaskRobotSensor,
            
        };

            