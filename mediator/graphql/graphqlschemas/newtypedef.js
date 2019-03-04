
                            export default `

                            scalar JSON
                            scalar DateTime

                            type Task {
                                _id: String
                                name: String
                                context: Context
                                robots: [Robot]
                                sensors: [Sensor]
                            }

                            type Robot {
                                _id: String
                                type: String
                                name: String
                                mac_address: String,
                                context: Context
                                sensors: [Sensor]
                                tasks: [Task]
                            }

                           type Sensor {
                                _id: String
                                type: String
                                name: String
                                description: String
                                measures: String
                                unit: String
                                value_schema: JSON
                                meta: JSON
                                context: Context
                                robots: [Robot]
                                tasks: [Task]
                            }

                            type Context {
                                _id: String
                                name: String
                                value: JSON
                            }
                                

                            type Query {

                                allRobots(
                                        name: String,
                                        mac_address: String,
                                    ): [Robot!] !,

                                    allSensors(
                                        name: String
                                    ): [Sensor!] !,

                                    allTasks(
                                        name: String
                                    ): [Task!] !,

                                    allContexts(
                                        name: String
                                    ): [Context!] !,

                                    getRobot(
                                        _id: String!
                                        name: String
                                    ): Robot

                                    getSensor(
                                        _id: String!
                                        name: String
                                    ): Sensor

                                    getTask(
                                        _id: String!
                                        name: String
                                    ): Task

                                
                            }

                            type Mutation {

                                createRobot(
                                        type: String!,
                                        name: String!,
                                        mac_address: String!,
                                        context: String!,
                                    ): Robot!

                                    createSensor(
                                        type: String!,
                                        name: String!,
                                        description: String!,
                                        measures: String!,
                                        value_schema: JSON!,
                                        unit: String!,
                                        meta: JSON!,
                                        context: String!,
                                    ): Sensor!

                                    createContext(
                                        name: String!
                                        value: JSON!,
                                    ): Context!
            
                                    
        }
        `
                        