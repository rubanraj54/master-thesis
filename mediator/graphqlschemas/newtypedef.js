
                            export default `

                            scalar JSON

                            type Robot {
                                _id: String
                                type: String
                                name: String
                                mac_address: String,
                                context: Context
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
                            }

                            type Context {
                                _id: String
                                name: String
                                value: JSON
                            }
                                
                            type VelocitySensor8Observation {
                                _id: String
                                type: String
                                name: String
                                featureOfInterest: String
                                sensor: Sensor
                                robot: Robot
                                value: [VelocitySensor8ObservationValue]
                            }
                            
                            type VelocitySensor8ObservationValue {
                                x: Int,
y: Int,

                            }
                    
                            input InputVelocitySensor8Observation {
                                _id: String
                                type: String
                                name: String
                                featureOfInterest: String
                                sensor: String
                                robot: String
                                value: [InputVelocitySensor8ObservationValue]
                            }
                    
                            input InputVelocitySensor8ObservationValue {
                                x: Int,
y: Int,

                    
                            }
                        

                            type VelocitySensorObservation {
                                _id: String
                                type: String
                                name: String
                                featureOfInterest: String
                                sensor: Sensor
                                robot: Robot
                                value: [VelocitySensorObservationValue]
                            }
                            
                            type VelocitySensorObservationValue {
                                x: Int,
y: Int,

                            }
                    
                            input InputVelocitySensorObservation {
                                _id: String
                                type: String
                                name: String
                                featureOfInterest: String
                                sensor: String
                                robot: String
                                value: [InputVelocitySensorObservationValue]
                            }
                    
                            input InputVelocitySensorObservationValue {
                                x: Int,
y: Int,

                    
                            }
                        

                            type Query {

                                allRobots(
                                        name: String,
                                        mac_address: String,
                                    ): [Robot!] !,

                                    allSensors(
                                        name: String
                                    ): [Sensor!] !,

                                    allContexts(
                                        name: String
                                    ): [Context!] !,

                                    getRobot(
                                        id: String!
                                    ): Robot!

                                
                        allVelocitySensor8Observations(
                            name: String
                        ): [VelocitySensor8Observation!] !,
                

                        allVelocitySensorObservations(
                            name: String
                        ): [VelocitySensorObservation!] !,
                
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
            
                                    
                        createVelocitySensor8Observation(
                            input: InputVelocitySensor8Observation!
                        ): VelocitySensor8Observation!
                

                        createVelocitySensorObservation(
                            input: InputVelocitySensorObservation!
                        ): VelocitySensorObservation!
                
        }
        `
                        