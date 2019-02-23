var fs = require("fs");
var path = require('path');
var appDir = path.dirname(__dirname);

module.exports = {
    updateGraphQlQuery(sensors) {
    
        let observationNames = [];
    
        sensors.forEach(sensor => {
            let observationName = sensor.name.split('_').map(function (sensorName) {
                return sensorName.charAt(0).toUpperCase() + sensorName.slice(1)
            }).join("");
            observationName += "Observation";
            observationNames.push(observationName);
        });
    
        let observationContexts = observationNames.join(',');
        console.log(observationContexts);
    
        let queries = [];
    
        observationNames.forEach(observationName => {
            let query = `
                all${observationName}s: async (parent, args, {Robot, Sensor,Context,${observationContexts}}) => {
                    const observations = await ${observationName}.find(args).populate({
                        path: 'robot',
                        populate : {
                            path: "context",
                            model: "Context"
                        }
                    }).populate({
                        path: 'sensor',
                        populate : {
                            path: "context",
                            model: "Context"
                        }
                    })
                    return observations.map(x => {
                        x._id = x._id.toString()
                        return x
                    })
                },            
            `;
            queries.push(query);
        });
    
        let finalQueries = queries.join('\n');
    
        let finalTemplate = `
            import groupBy from 'lodash/groupBy'
            import forEach from 'lodash/forEach'
            export default {
            allRobots: async (parent, args, {Task, Robot,Sensor, Context, TaskRobotSensor }) => {
                const robots = await Robot.find(args).populate('context')
                return robots.map(async x => {
                    let robotsensors = await TaskRobotSensor.find({robot : x._id.toString()})

                    robotsensors = await Promise.all(robotsensors.map(async _taskrobotsensor => {
                        let task = await Task.findOne({_id : _taskrobotsensor.task});
                        let robot = await Robot.findOne({_id : _taskrobotsensor.robot});
                        let sensor = await Sensor.findOne({_id : _taskrobotsensor.sensor});
                        return { task, robot, sensor};
                    }));

                    let groupByTask = groupBy(robotsensors, (robotsensor => robotsensor.task._id));
                    let tasks = [];  
                    forEach(groupByTask, (taskRobotSensors, key) => {
                        let task = taskRobotSensors[0].task.toObject();
                        let groupByRobot = groupBy(taskRobotSensors, (taskRobotSensor => taskRobotSensor.robot._id));
                        let robots = [];
                        forEach(groupByRobot,(_taskRobotSensors,key) => {
                            let robot = _taskRobotSensors[0].robot.toObject();
                            
                            let sensors = _taskRobotSensors.map(_taskRobotSensor => {
                                return _taskRobotSensor.sensor
                            });
                            
                            robot.sensors = sensors;
                            robots.push(robot);
                        });                    

                        task.robots = robots;
                        tasks.push(task);
                    });
                    
                    if (robotsensors.length != 0) {
                        x.sensors = robotsensors.map(robotsensor => {
                            robotsensor.sensor._id = robotsensor.sensor._id.toString();
                            return robotsensor.sensor;
                        });
                    }                
                    x.tasks = tasks;    
                    x._id = x._id.toString()
                    return x
                })
            },
            getRobot: async (parent, args, {Task, Robot,Sensor, Context, TaskRobotSensor }) => {

                const robot = await Robot.findOne(args).populate('context')
                
                if (!robot) {
                    return;
                }
                
                let robotsensors = await TaskRobotSensor.find({robot : args._id.toString()});

                robotsensors = await Promise.all(robotsensors.map(async _taskrobotsensor => {
                    let task = await Task.findOne({_id : _taskrobotsensor.task});
                    let robot = await Robot.findOne({_id : _taskrobotsensor.robot});
                    let sensor = await Sensor.findOne({_id : _taskrobotsensor.sensor});
                    return { task, robot, sensor};
                })); 
                
                let groupByTask = groupBy(robotsensors, (robotsensor => robotsensor.task._id));
                let tasks = [];
                forEach(groupByTask, (taskRobotSensors, key) => {
                    let task = taskRobotSensors[0].task.toObject();
                    let groupByRobot = groupBy(taskRobotSensors, (taskRobotSensor => taskRobotSensor.robot._id));
                    let robots = [];
                    forEach(groupByRobot,(_taskRobotSensors,key) => {
                        let robot = _taskRobotSensors[0].robot.toObject();
                        
                        let sensors = _taskRobotSensors.map(_taskRobotSensor => {
                            return _taskRobotSensor.sensor
                        });
                        
                        robot.sensors = sensors;
                        robots.push(robot);
                    });                    

                    task.robots = robots;
                    tasks.push(task);
                });

                if (robotsensors.length != 0) {
                    robot.sensors = robotsensors.map(x => {
                        x.sensor._id = x.sensor._id.toString();
                        return x.sensor;
                    });
                }

                robot.tasks = tasks;
                
                robot._id = robot.id.toString();
                return robot;
            },
            getTask: async (parent, args, {Task, Robot,Sensor, Context, TaskRobotSensor  }) => {

                const task = await Task.findOne(args).populate('context')
                
                if (!task) {
                    return;
                }

                let robotsensors = await TaskRobotSensor.find({task : args._id.toString()});

                robotsensors = await Promise.all(robotsensors.map(async _taskrobotsensor => {
                    let robot = await Robot.findOne({_id : _taskrobotsensor.robot});
                    let sensor = await Sensor.findOne({_id : _taskrobotsensor.sensor});
                    return { robot, sensor};
                }));                                                         

                
                let groupByRobot = groupBy(robotsensors, (robotsensor => robotsensor.robot._id));
                let robots = [];
                forEach(groupByRobot,(taskRobotSensors,key) => {
                    let robot = taskRobotSensors[0].robot.toObject();
                    
                    let sensors = taskRobotSensors.map(taskRobotSensor => {
                        return taskRobotSensor.sensor
                    });
                    
                    robot.sensors = sensors;
                    robots.push(robot);
                });

                task.robots = robots;
                
                task._id = task.id.toString();
                return task;
            },
            getSensor: async (parent, args, { Task, Robot,Sensor, Context, TaskRobotSensor }) => {

                const sensor = await Sensor.findOne(args).populate('context')
                
                if (!sensor) {
                    return;
                }
                
                let robotsensors = await TaskRobotSensor.find({sensor : args._id.toString()});

                robotsensors = await Promise.all(robotsensors.map(async _taskrobotsensor => {
                    let task = await Task.findOne({_id : _taskrobotsensor.task});
                    let robot = await Robot.findOne({_id : _taskrobotsensor.robot});
                    let sensor = await Sensor.findOne({_id : _taskrobotsensor.sensor});
                    return { task, robot, sensor};
                })); 

                let groupByTask = groupBy(robotsensors, (robotsensor => robotsensor.task._id));
                let tasks = [];
                forEach(groupByTask, (taskRobotSensors, key) => {
                    let task = taskRobotSensors[0].task.toObject();
                    let groupByRobot = groupBy(taskRobotSensors, (taskRobotSensor => taskRobotSensor.robot._id));
                    let robots = [];
                    forEach(groupByRobot,(_taskRobotSensors,key) => {
                        let robot = _taskRobotSensors[0].robot.toObject();
                        
                        let sensors = _taskRobotSensors.map(_taskRobotSensor => {
                            return _taskRobotSensor.sensor
                        });
                        
                        robot.sensors = sensors;
                        robots.push(robot);
                    });                    

                    task.robots = robots;
                    tasks.push(task);
                });
                
                if (robotsensors.length != 0) {
                    sensor.robots = robotsensors.map(x => {
                        x.robot._id = x.robot._id.toString();
                        return x.robot;
                    });
                }
                sensor.tasks = tasks;
                sensor._id = sensor.id.toString();
                return sensor;
            },
            allSensors: async (parent, args, { Task, Robot,Sensor, Context, TaskRobotSensor }) => {
                const sensors = await Sensor.find(args).populate('context');
                return sensors.map(async x => {
                    let robotsensors = await TaskRobotSensor.find({sensor : x._id.toString()});
                    
                    robotsensors = await Promise.all(robotsensors.map(async _taskrobotsensor => {
                        let task = await Task.findOne({_id : _taskrobotsensor.task});
                        let robot = await Robot.findOne({_id : _taskrobotsensor.robot});
                        let sensor = await Sensor.findOne({_id : _taskrobotsensor.sensor});
                        return { task, robot, sensor};
                    })); 
                    
                    let groupByTask = groupBy(robotsensors, (robotsensor => robotsensor.task._id));
                    let tasks = [];   
                    
                    forEach(groupByTask, (taskRobotSensors, key) => {
                        let task = taskRobotSensors[0].task.toObject();
                        let groupByRobot = groupBy(taskRobotSensors, (taskRobotSensor => taskRobotSensor.robot._id));
                        let robots = [];
                        forEach(groupByRobot,(_taskRobotSensors,key) => {
                            let robot = _taskRobotSensors[0].robot.toObject();
                            
                            let sensors = _taskRobotSensors.map(_taskRobotSensor => {
                                return _taskRobotSensor.sensor
                            });
                            
                            robot.sensors = sensors;
                            robots.push(robot);
                        });                    
    
                        task.robots = robots;
                        tasks.push(task);
                    }); 
                    
                    if (robotsensors.length != 0) {
                        x.robots = robotsensors.map(robotsensor => {
                            robotsensor.robot._id = robotsensor.robot._id.toString();
                            return robotsensor.robot;
                        });
                    }     
                    
                    x.tasks = tasks;                
                    x._id = x._id.toString()
                    return x
                })
            },
            allTasks: async (parent, args, { Task, Robot,Sensor, Context, TaskRobotSensor }) => {
                const tasks = await Task.find(args).populate('context');
                return tasks.map(async x => {
                    let robotsensors = await TaskRobotSensor.find({task : x._id.toString()});
                    
                    robotsensors = await Promise.all(robotsensors.map(async _taskrobotsensor => {
                        let robot = await Robot.findOne({_id : _taskrobotsensor.robot});
                        let sensor = await Sensor.findOne({_id : _taskrobotsensor.sensor});
                        return { robot, sensor};
                    })); 
                    
                    let groupByRobot = groupBy(robotsensors, (robotsensor => robotsensor.robot._id));
                    let robots = [];   
                    
                    forEach(groupByRobot,(taskRobotSensors,key) => {
                        let robot = taskRobotSensors[0].robot.toObject();
                        
                        let sensors = taskRobotSensors.map(taskRobotSensor => {
                            return taskRobotSensor.sensor
                        });
                        
                        robot.sensors = sensors;
                        robots.push(robot);
                    });
    
                    x.robots = robots; 
                    return x
                })
            },
            allContexts: async (parent, args, { Context }) => {
                const contexts = await Context.find(args)
                return contexts.map(x => {
                x._id = x._id.toString()
                return x
                })
            },
            ${finalQueries}
            }
        `;
        var writeStream = fs.createWriteStream(appDir + "/graphqlschemas/" + "newqueries.js");
        writeStream.write(finalTemplate);
        writeStream.end();
    }
}

