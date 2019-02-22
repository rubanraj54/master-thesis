
// ES5
const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:password@localhost:3308/db');
const Context = require("./models/context")(sequelize,Sequelize);
const Task = require("./models/task")(sequelize,Sequelize,Context);
const Robot = require("./models/robot")(sequelize,Sequelize,Context);
const Sensor = require("./models/sensor")(sequelize,Sequelize,Context);
const TaskRobotSensor = require("./models/task-robot-sensor")(sequelize,Sequelize,Task, Robot, Sensor);

const dummyData = require('../schema_registry/toy_data/test.json'); 
const has = require('lodash/has');
const uuid = require('uuid/v4');
sequelize.sync().then(async () => {
    // let context = await Context.create({ name: 'context1', value: JSON.stringify({'test':'ruban'})});
    // let robot = await Robot.create({ name: 'robot1', type: 'industrial', mac_address: 'xx:xx:xx:xx',description: "dummy text",contextId:"180e5f32-371e-49dc-bea6-7e26b752fbee"});
    // console.log(robot.get({plain:true}));
    // let robots = await Robot.findAll({
    //     raw: true,
    //     nest: true,
    //     include: [{
    //         model: Context,
    //     }]
    // });
    // console.log(JSON.parse(robots[0].context.value).test);
    let data = dummyData;
    let finalResponse = {
        task: {
            _id: ""
        },
        robots:[]
    }
    
    // creating test record (context field is mandatory)
    let taskInfo = data.task;
    let task = await Task.create(taskInfo);
    finalResponse.task._id = task._id;


    // creating all robots and sensors
    let robots = data.robots;
    if(robots && robots.length > 0) {
        await Promise.all(robots.map(async _robot => {
            let newRobotId = has(_robot, '_id') ? _robot._id :(await Robot.create(_robot))._id;

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
        console.log(finalResponse);
        return;
    }
    
    return;
    // update main.js which exports all contexts to graphql
    exportContexts();

    // get all sensors & update graphql component
    let sensors = await Sensor.find({});
    updateGraphQl(sensors);

    response.send(finalResponse);
    
}

);

async function registerSensors(sensors) {
    return await Promise.all(sensors.map(async _sensor => {
        if (!has(_sensor, '_id')) {
            _sensor.value_schema = JSON.parse(JSON.stringify(_sensor.value_schema).replace(/\$schema/g, "schema"));
            let newSensor = await Sensor.create(_sensor);
            // createObservationModel(newSensor.name, newSensor.value_schema);
            return newSensor._id.toString();
        } else {
            return _sensor._id;
        }
    }));
}

async function registerRobotSensors(taskId, robotId, sensorIds) {
    return sensorIds.forEach(async sensorId => {
        await TaskRobotSensor.create({
            taskId,
            robotId,
            sensorId,
            timestamp: new Date()
        });
    })
}

// test(); 

// async function test () {
//     let context = await Context.create({ name: 'context1', value: JSON.stringify({'test':'ruban'})});
//     // let robot = await Robot.create({ name: 'robot1', type: 'industrial', mac_address: 'xx:xx:xx:xx',description: "dummy text",contextId:"41428c55-3e3b-4140-8bce-86f8181d9dca"});
//     // console.log(robot.get({plain:true}));
// }