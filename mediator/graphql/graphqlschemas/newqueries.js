            import groupBy from 'lodash/groupBy'
            import forEach from 'lodash/forEach'

            export default {
            allRobots: async (parent, args, { Robot, TaskRobotSensor }) => {
                const robots = await Robot.find(args).populate('context')
                return robots.map(async x => {
                    const robotsensors = await TaskRobotSensor.find({robot : x._id.toString()})
                                                        .populate({
                                                            path: 'sensor',
                                                            populate: {
                                                                path: "context",
                                                                model: "Context"
                                                            }
                                                        })
                    
                    if (robotsensors.length != 0) {
                        x.sensors = robotsensors.map(robotsensor => {
                            robotsensor.sensor._id = robotsensor.sensor._id.toString();
                            return robotsensor.sensor;
                        });
                    }                    
                    x._id = x._id.toString()
                    return x
                })
            },
            getRobot: async (parent, args, { Robot, TaskRobotSensor }) => {

                const robot = await Robot.findOne(args).populate('context')
                
                if (!robot) {
                    return;
                }
                
                const robotsensors = await TaskRobotSensor.find({robot : args._id.toString()})
                                                        .populate({
                                                            path: 'sensor',
                                                            populate: {
                                                                path: "context",
                                                                model: "Context"
                                                            }
                                                        })
                                                        .populate({
                                                            path: 'robot',
                                                            populate: {
                                                                path: "context",
                                                                model: "Context"
                                                            }
                                                        })
                                                        .populate('task')
                let groupByTask = groupBy(robotsensors, (robotsensor => robotsensor.task._id));
                let tasks = [];
                forEach(groupByTask, (taskRobotSensors, key) => {
                    let task = taskRobotSensors[0].task.toObject();

                    let sensors = taskRobotSensors.map(taskRobotSensor => {
                        return taskRobotSensor.sensor
                    });
                    let robots = taskRobotSensors.map(taskRobotSensor => {
                        return taskRobotSensor.robot
                    });

                    task.sensors = sensors;
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
            getTask: async (parent, args, {Task, TaskRobotSensor }) => {

                const task = await Task.findOne(args).populate('context')
                
                if (!task) {
                    return;
                }

                const robotsensors = await TaskRobotSensor.find({task : args._id.toString()})
                                                        .populate({
                                                            path: 'robot',
                                                            populate: {
                                                                path: "context",
                                                                model: "Context"
                                                            }
                                                        })
                                                        .populate({
                                                            path: 'sensor',
                                                            populate: {
                                                                path: "context",
                                                                model: "Context"
                                                            }
                                                        })

                
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
            getSensor: async (parent, args, {  Sensor, TaskRobotSensor }) => {

                const sensor = await Sensor.findOne(args).populate('context')
                
                if (!sensor) {
                    return;
                }
                
                const robotsensors = await TaskRobotSensor.find({sensor : args._id.toString()})
                                                        .populate({
                                                                path: 'sensor',
                                                                populate: {
                                                                    path: "context",
                                                                    model: "Context"
                                                                }
                                                            })
                                                            .populate({
                                                                path: 'robot',
                                                                populate: {
                                                                    path: "context",
                                                                    model: "Context"
                                                                }
                                                            })
                                                            .populate('task')
                let groupByTask = groupBy(robotsensors, (robotsensor => robotsensor.task._id));
                let tasks = [];
                forEach(groupByTask, (taskRobotSensors, key) => {
                    let task = taskRobotSensors[0].task.toObject();

                    let sensors = taskRobotSensors.map(taskRobotSensor => {
                        return taskRobotSensor.sensor
                    });
                    let robots = taskRobotSensors.map(taskRobotSensor => {
                        return taskRobotSensor.robot
                    });

                    task.sensors = sensors;
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
            allSensors: async (parent, args, { Sensor, TaskRobotSensor }) => {
                const sensors = await Sensor.find(args).populate('context');
                return sensors.map(async x => {
                    const robotsensors = await TaskRobotSensor.find({sensor : x._id.toString()})
                                                        .populate({
                                                            path: 'robot',
                                                            populate: {
                                                                path: "context",
                                                                model: "Context"
                                                            }
                                                        })
                    
                    if (robotsensors.length != 0) {
                        x.robots = robotsensors.map(robotsensor => {
                            robotsensor.robot._id = robotsensor.robot._id.toString();
                            return robotsensor.robot;
                        });
                    }                    
                    x._id = x._id.toString()
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
            
                allVelocitySensor8Observations: async (parent, args, {Robot, Sensor,Context, TaskRobotSensor ,VelocitySensor8Observation,VelocitySensorObservation}) => {
                    const observations = await VelocitySensor8Observation.find(args).populate({
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
            

                allVelocitySensorObservations: async (parent, args, {Robot, Sensor,Context, TaskRobotSensor,VelocitySensor8Observation,VelocitySensorObservation}) => {
                    const observations = await VelocitySensorObservation.find(args).populate({
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
            
            // getRobot: async (parent, args, { Robot, Sensor}) => {
            //   const robot = await Robot.findById(args.id)
            //   return robot
            // }
            }
        