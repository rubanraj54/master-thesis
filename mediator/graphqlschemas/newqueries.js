            import has from 'lodash/has'

            export default {
            allRobots: async (parent, args, { Robot, Sensor, Context, RobotSensor }) => {
                const robots = await Robot.find(args).populate('context')
                return robots.map(async x => {
                    const robotsensors = await RobotSensor.find({robot : x._id.toString()})
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
            getRobot: async (parent, args, { Robot, Sensor, Context, RobotSensor }) => {

                const robot = await Robot.findOne(args).populate('context')
                
                if (!robot) {
                    return;
                }
                
                const robotsensors = await RobotSensor.find({robot : args._id.toString()})
                                                        .populate({
                                                            path: 'sensor',
                                                            populate: {
                                                                path: "context",
                                                                model: "Context"
                                                            }
                                                        })
                
                if (robotsensors.length != 0) {
                    robot.sensors = robotsensors.map(x => {
                        x.sensor._id = x.sensor._id.toString();
                        return x.sensor;
                    });
                }
                
                robot._id = robot.id.toString();
                return robot;
            },
            getSensor: async (parent, args, { Robot, Sensor, Context, RobotSensor }) => {

                const sensor = await Sensor.findOne(args).populate('context')
                
                if (!sensor) {
                    return;
                }
                
                const robotsensors = await RobotSensor.find({sensor : args._id.toString()})
                                                        .populate({
                                                            path: 'robot',
                                                            populate: {
                                                                path: "context",
                                                                model: "Context"
                                                            }
                                                        })
                
                if (robotsensors.length != 0) {
                    sensor.robots = robotsensors.map(x => {
                        x.robot._id = x.robot._id.toString();
                        return x.robot;
                    });
                }
                
                sensor._id = sensor.id.toString();
                return sensor;
            },
            allSensors: async (parent, args, { Robot, Sensor, Context, RobotSensor }) => {
                const sensors = await Sensor.find(args).populate('context');
                return sensors.map(async x => {
                    const robotsensors = await RobotSensor.find({sensor : x._id.toString()})
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
            allContexts: async (parent, args, { Robot, Sensor, Context, RobotSensor }) => {
                const contexts = await Context.find(args)
                return contexts.map(x => {
                x._id = x._id.toString()
                return x
                })
            },
            
                allVelocitySensor8Observations: async (parent, args, {Robot, Sensor,Context, RobotSensor ,VelocitySensor8Observation,VelocitySensorObservation}) => {
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
            

                allVelocitySensorObservations: async (parent, args, {Robot, Sensor,Context, RobotSensor,VelocitySensor8Observation,VelocitySensorObservation}) => {
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
        