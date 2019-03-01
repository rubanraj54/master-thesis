var fs = require("fs");
var path = require('path');
var appDir = path.dirname(__dirname);
import {
    generateObservationName,
} from "../general/utils"

module.exports = {
    updateGraphQlQuery(sensors) {
    
        let observationNames = [];
    
        sensors.forEach(sensor => {
            observationNames.push(generateObservationName(sensor.name));
        });
    
        let observationContexts = observationNames.join(',');
        console.log(observationContexts);
    
        let queries = [];
    
        observationNames.forEach(observationName => {
            let query = `
                all${observationName}s: async (parent, args, {Task, Robot, Sensor, MongoContext,Context,${observationContexts}}) => {
                    let observations = null;
                    if (observationDb == "mongodb") {
                        observations = await ${observationName}.find(args);
                    } else if (observationDb == "mysql") {
                        observations = await ${observationName}.findAll({
                            where: args,
                            raw: true,
                            nest: true
                        });
                    }
                    
                    return await Promise.all(observations.map(async observation => {
                        if (taskDb == "mongodb") {
                            observation.task = await Task.findOne({_id : observation.task});
                        } else if (taskDb == "mysql") {
                            observation.task = await Task.findOne({where:{_id : observation.task}});
                        }
                        
                        if (robotDb == "mongodb") {
                            observation.robot = await Robot.findOne({_id : observation.robot});
                        } else if (robotDb == "mysql") {
                            observation.robot = await Robot.findOne({where:{_id : observation.robot}});
                            
                        }
                        
                        if (sensorDb == "mongodb") {
                            observation.sensor = await Sensor.findOne({_id : observation.sensor});
                        } else if (sensorDb == "mysql") {
                            observation.sensor = await Sensor.findOne({where:{_id : observation.sensor}});
                        }   

                        return observation;
                    }));
                },            
            `;
            queries.push(query);
        });
    
        let finalQueries = queries.join('\n');
    
        let finalTemplate = `
            import groupBy from 'lodash/groupBy'
            import forEach from 'lodash/forEach'

            const low = require('lowdb')
            const FileSync = require('lowdb/adapters/FileSync')
            const mediatorConfigAdapter = new FileSync('mediatorconfig.json')
            const mediatorConfig = low(mediatorConfigAdapter)
            const dbConfigs = mediatorConfig.get('db').value();
            
            const taskDbConfig = dbConfigs.find((dbConfig) => dbConfig.entities.findIndex((entity) => entity === "task") > -1);
            const taskDb = taskDbConfig.name

            const robotDbConfig = dbConfigs.find((dbConfig) => dbConfig.entities.findIndex((entity) => entity === "robot") > -1);
            const robotDb = robotDbConfig.name

            const sensorDbConfig = dbConfigs.find((dbConfig) => dbConfig.entities.findIndex((entity) => entity === "sensor") > -1);
            const sensorDb = sensorDbConfig.name

            const taskrobotsensorDbConfig = dbConfigs.find((dbConfig) => dbConfig.entities.findIndex((entity) => entity === "taskrobotsensor") > -1);
            const taskrobotsensorDb = taskrobotsensorDbConfig.name

            const observationDbConfig = dbConfigs.find((dbConfig) => dbConfig.entities.findIndex((entity) => entity === "observation") > -1);
            const observationDb = observationDbConfig.name

            export default {
            allRobots: async (parent, args, {Task, Robot,Sensor, MongoContext, Context, TaskRobotSensor }) => {

                let robots = [];
                
                if (robotDb == "mongodb") {
                    robots = await Robot.find(args).populate('context')
                } else if (robotDb == "mysql") {
                    robots = await Robot.findAll({
                        raw: true,
                        nest: true
                    });
                }

                return robots.map(async x => {
                    let robotsensors = [];

                    if (taskrobotsensorDb == "mongodb") {
                        robotsensors = await TaskRobotSensor.find({robot : x._id.toString()})
                    } else if (taskrobotsensorDb == "mysql") {
                        robotsensors = await TaskRobotSensor.findAll({
                            where: {robot : x._id.toString()},
                            raw: true,
                            nest: true
                        });                        
                    }
                    
                    robotsensors = await Promise.all(robotsensors.map(async _taskrobotsensor => {
                        
                        let task = null;
                        if (taskDb == "mongodb") {
                            task = await Task.findOne({_id : _taskrobotsensor.task});
                        } else if (taskDb == "mysql") {
                            task = await Task.findOne({where:{_id : _taskrobotsensor.task}});
                        }
                        
                        let robot = null;
                        if (robotDb == "mongodb") {
                            robot = await Robot.findOne({_id : _taskrobotsensor.robot});
                        } else if (robotDb == "mysql") {
                            robot = await Robot.findOne({where:{_id : _taskrobotsensor.robot}});
                            
                        }
                        
                        let sensor = null;
                        if (sensorDb == "mongodb") {
                            sensor = await Sensor.findOne({_id : _taskrobotsensor.sensor});
                        } else if (sensorDb == "mysql") {
                            sensor = await Sensor.findOne({where:{_id : _taskrobotsensor.sensor}});
                        }
                        
                        return { task, robot, sensor};
                    }));

                    let groupByTask = groupBy(robotsensors, (robotsensor => robotsensor.task._id));
                    let tasks = [];  
                    forEach(groupByTask, (taskRobotSensors, key) => {
                        let task = taskRobotSensors[0].task;
                        let groupByRobot = groupBy(taskRobotSensors, (taskRobotSensor => taskRobotSensor.robot._id));
                        let robots = [];
                        forEach(groupByRobot,(_taskRobotSensors,key) => {
                            let robot = _taskRobotSensors[0].robot;
                            
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
            getRobot: async (parent, args, {Task, Robot,Sensor, MongoContext, Context, TaskRobotSensor }) => {

                let robot = null;
                
                if (robotDb == "mongodb") {
                    robot = await Robot.findOne(args).populate('context')
                } else if (robotDb == "mysql") {
                    robot = await Robot.findOne({where: args});
                }

                if (!robot) {
                    return;
                }
                
                let robotsensors = [];
                    
                if (taskrobotsensorDb == "mongodb") {
                    robotsensors = await TaskRobotSensor.find({robot : args._id.toString()})
                } else if (taskrobotsensorDb == "mysql") {
                    robotsensors = await TaskRobotSensor.findAll({
                        where: {robot : args._id.toString()},
                        raw: true,
                        nest: true
                    });
                }

                robotsensors = await Promise.all(robotsensors.map(async _taskrobotsensor => {
                        
                    let task = null;
                    if (taskDb == "mongodb") {
                        task = await Task.findOne({_id : _taskrobotsensor.task});
                    } else if (taskDb == "mysql") {
                        task = await Task.findOne({where:{_id : _taskrobotsensor.task}});
                    }
                    
                    let robot = null;
                    if (robotDb == "mongodb") {
                        robot = await Robot.findOne({_id : _taskrobotsensor.robot});
                    } else if (robotDb == "mysql") {
                        robot = await Robot.findOne({where:{_id : _taskrobotsensor.robot}});
                        
                    }
                    
                    let sensor = null;
                    if (sensorDb == "mongodb") {
                        sensor = await Sensor.findOne({_id : _taskrobotsensor.sensor});
                    } else if (sensorDb == "mysql") {
                        sensor = await Sensor.findOne({where:{_id : _taskrobotsensor.sensor}});
                    }
                    
                    return { task, robot, sensor};
                })); 
                
                let groupByTask = groupBy(robotsensors, (robotsensor => robotsensor.task._id));
                let tasks = [];
                forEach(groupByTask, (taskRobotSensors, key) => {
                    let task = taskRobotSensors[0].task;
                    let groupByRobot = groupBy(taskRobotSensors, (taskRobotSensor => taskRobotSensor.robot._id));
                    let robots = [];
                    forEach(groupByRobot,(_taskRobotSensors,key) => {
                        let robot = _taskRobotSensors[0].robot;
                        
                        let sensors = _taskRobotSensors.map(_taskRobotSensor => _taskRobotSensor.sensor);
                        
                        robot.sensors = sensors;
                        robots.push(robot);
                    });                    

                    task.robots = robots;
                    tasks.push(task);
                });

                if (robotsensors.length != 0) {
                    robot.sensors = robotsensors.map(x => x.sensor);
                }

                robot.tasks = tasks;
                return robot;
            },
            getTask: async (parent, args, {Task, Robot,Sensor, MongoContext, Context, TaskRobotSensor  }) => {

                let task = null;
                
                if (taskDb == "mongodb") {
                    task = await Task.findOne(args).populate('context')
                } else if (taskDb == "mysql") {
                    task = await Task.findOne({where: args});
                }

                if (!task) {
                    return;
                }

                let robotsensors = [];
                    
                if (taskrobotsensorDb == "mongodb") {
                    robotsensors = await TaskRobotSensor.find({task : args._id.toString()})
                } else if (taskrobotsensorDb == "mysql") {
                    robotsensors = await TaskRobotSensor.findAll({
                        where: {task : args._id.toString()},
                        raw: true,
                        nest: true
                    });
                }                                                        
                
                robotsensors = await Promise.all(robotsensors.map(async _taskrobotsensor => {

                    let robot = null;
                    if (robotDb == "mongodb") {
                        robot = await Robot.findOne({_id : _taskrobotsensor.robot});
                    } else if (robotDb == "mysql") {
                        robot = await Robot.findOne({where:{_id : _taskrobotsensor.robot}});
                        
                    }
                    
                    let sensor = null;
                    if (sensorDb == "mongodb") {
                        sensor = await Sensor.findOne({_id : _taskrobotsensor.sensor});
                    } else if (sensorDb == "mysql") {
                        sensor = await Sensor.findOne({where:{_id : _taskrobotsensor.sensor}});
                    }
                    
                    return {robot, sensor};
                })); 

                let groupByRobot = groupBy(robotsensors, (robotsensor => robotsensor.robot._id));
                let robots = [];
                forEach(groupByRobot,(taskRobotSensors,key) => {
                    let robot = taskRobotSensors[0].robot;
                    robot.sensors = taskRobotSensors.map(taskRobotSensor => taskRobotSensor.sensor);
                    robots.push(robot);
                });

                task.robots = robots;
                return task;
            },
            getSensor: async (parent, args, { Task, Robot,Sensor, MongoContext, Context, TaskRobotSensor }) => {

                let sensor = null;
                
                if (sensorDb == "mongodb") {
                    sensor = await Sensor.findOne(args).populate('context')
                } else if (sensorDb == "mysql") {
                    sensor = await Sensor.findOne({where: args});
                }
                
                if (!sensor) {
                    return;
                }
                let robotsensors = [];
                    
                if (taskrobotsensorDb == "mongodb") {
                    robotsensors = await TaskRobotSensor.find({sensor : args._id.toString()})
                } else if (taskrobotsensorDb == "mysql") {
                    robotsensors = await TaskRobotSensor.findAll({
                        where: {sensor : args._id.toString()},
                        raw: true,
                        nest: true
                    });
                }

                robotsensors = await Promise.all(robotsensors.map(async _taskrobotsensor => {
                        
                    let task = null;
                    if (taskDb == "mongodb") {
                        task = await Task.findOne({_id : _taskrobotsensor.task});
                    } else if (taskDb == "mysql") {
                        task = await Task.findOne({where:{_id : _taskrobotsensor.task}});
                    }
                    
                    let robot = null;
                    if (robotDb == "mongodb") {
                        robot = await Robot.findOne({_id : _taskrobotsensor.robot});
                    } else if (robotDb == "mysql") {
                        robot = await Robot.findOne({where:{_id : _taskrobotsensor.robot}});
                        
                    }
                    
                    let sensor = null;
                    if (sensorDb == "mongodb") {
                        sensor = await Sensor.findOne({_id : _taskrobotsensor.sensor});
                    } else if (sensorDb == "mysql") {
                        sensor = await Sensor.findOne({where:{_id : _taskrobotsensor.sensor}});
                    }
                    
                    return { task, robot, sensor};
                })); 

                let groupByTask = groupBy(robotsensors, (robotsensor => robotsensor.task._id));
                let tasks = [];
                forEach(groupByTask, (taskRobotSensors, key) => {
                    let task = taskRobotSensors[0].task;
                    let groupByRobot = groupBy(taskRobotSensors, (taskRobotSensor => taskRobotSensor.robot._id));
                    let robots = [];
                    forEach(groupByRobot,(_taskRobotSensors,key) => {
                        let robot = _taskRobotSensors[0].robot;
                        
                        let sensors = _taskRobotSensors.map(_taskRobotSensor => _taskRobotSensor.sensor);
                        
                        robot.sensors = sensors;
                        robots.push(robot);
                    });                    

                    task.robots = robots;
                    tasks.push(task);
                });
                
                if (robotsensors.length != 0) {
                    sensor.robots = robotsensors.map(x => x.robot);
                }
                sensor.tasks = tasks;
                return sensor;
            },
            allSensors: async (parent, args, { Task, Robot,Sensor, MongoContext, Context, TaskRobotSensor }) => {
                let sensors = [];
                
                if (sensorDb == "mongodb") {
                    sensors = await Sensor.find(args).populate('context')
                } else if (sensorDb == "mysql") {
                    sensors = await Sensor.findAll({
                        raw: true,
                        nest: true
                    });
                }

                return sensors.map(async x => {
                    let robotsensors = [];
                    
                    if (taskrobotsensorDb == "mongodb") {
                        robotsensors = await TaskRobotSensor.find({sensor : x._id.toString()})
                    } else if (taskrobotsensorDb == "mysql") {
                        robotsensors = await TaskRobotSensor.findAll({
                            where: {sensor : x._id.toString()},
                            raw: true,
                            nest: true
                        });
                    }
                    
                    robotsensors = await Promise.all(robotsensors.map(async _taskrobotsensor => {
                        
                        let task = null;
                        if (taskDb == "mongodb") {
                            task = await Task.findOne({_id : _taskrobotsensor.task});
                        } else if (taskDb == "mysql") {
                            task = await Task.findOne({where:{_id : _taskrobotsensor.task}});
                        }
                        
                        let robot = null;
                        if (robotDb == "mongodb") {
                            robot = await Robot.findOne({_id : _taskrobotsensor.robot});
                        } else if (robotDb == "mysql") {
                            robot = await Robot.findOne({where:{_id : _taskrobotsensor.robot}});
                            
                        }
                        
                        let sensor = null;
                        if (sensorDb == "mongodb") {
                            sensor = await Sensor.findOne({_id : _taskrobotsensor.sensor});
                        } else if (sensorDb == "mysql") {
                            sensor = await Sensor.findOne({where:{_id : _taskrobotsensor.sensor}});
                        }
                        
                        return { task, robot, sensor};
                    }));
                    
                    let groupByTask = groupBy(robotsensors, (robotsensor => robotsensor.task._id));
                    let tasks = [];   
                    
                    forEach(groupByTask, (taskRobotSensors, key) => {
                        let task = taskRobotSensors[0].task;
                        let groupByRobot = groupBy(taskRobotSensors, (taskRobotSensor => taskRobotSensor.robot._id));
                        let robots = [];
                        forEach(groupByRobot,(_taskRobotSensors,key) => {
                            let robot = _taskRobotSensors[0].robot;
                            
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
            allTasks: async (parent, args, { Task, Robot,Sensor, MongoContext, Context, TaskRobotSensor }) => {
                let tasks = [];
                
                if (taskDb == "mongodb") {
                    tasks = await Task.find(args).populate('context')
                } else if (taskDb == "mysql") {
                    tasks = await Task.findAll({
                        raw: true,
                        nest: true
                    });
                }

                return tasks.map(async x => {

                    let robotsensors = [];
                    
                    if (taskrobotsensorDb == "mongodb") {
                        robotsensors = await TaskRobotSensor.find({task : x._id.toString()})
                    } else if (taskrobotsensorDb == "mysql") {
                        robotsensors = await TaskRobotSensor.findAll({
                            where: {task : x._id.toString()},
                            raw: true,
                            nest: true
                        });
                    }
                    
                    robotsensors = await Promise.all(robotsensors.map(async _taskrobotsensor => {
                        
                        let robot = null;
                        if (robotDb == "mongodb") {
                            robot = await Robot.findOne({_id : _taskrobotsensor.robot});
                        } else if (robotDb == "mysql") {
                            robot = await Robot.findOne({where:{_id : _taskrobotsensor.robot}});
                            
                        }
                        
                        let sensor = null;
                        if (sensorDb == "mongodb") {
                            sensor = await Sensor.findOne({_id : _taskrobotsensor.sensor});
                        } else if (sensorDb == "mysql") {
                            sensor = await Sensor.findOne({where:{_id : _taskrobotsensor.sensor}});
                        }
                        
                        return { robot, sensor};
                    }));
                    
                    let groupByRobot = groupBy(robotsensors, (robotsensor => robotsensor.robot._id));
                    let robots = [];   
                    
                    forEach(groupByRobot,(taskRobotSensors,key) => {
                        let robot = taskRobotSensors[0].robot;
                        robot.sensors =  taskRobotSensors.map(taskRobotSensor => taskRobotSensor.sensor);
                        robots.push(robot);
                    });
    
                    x.robots = robots; 
                    return x
                })
            },
            allContexts: async (parent, args, { MongoContext, Context }) => {
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

