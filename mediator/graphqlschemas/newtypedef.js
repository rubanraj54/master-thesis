
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
                                
                            type AccelorometerSensorObservation {
                                _id: String
                                type: String
                                name: String
                                featureOfInterest: String
                                sensor: Sensor
                                robot: Robot
                                value: [AccelorometerSensorObservationValue]
                            }
                            
                            type AccelorometerSensorObservationValue {
                                x: Int,
y: Int,

                            }
                    
                            input InputAccelorometerSensorObservation {
                                _id: String
                                type: String
                                name: String
                                featureOfInterest: String
                                sensor: String
                                robot: String
                                value: InputAccelorometerSensorObservationValue
                            }
                    
                            input InputAccelorometerSensorObservationValue {
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
                                value: InputVelocitySensorObservationValue
                            }
                    
                            input InputVelocitySensorObservationValue {
                                x: Int,
y: Int,

                    
                            }
                        

                            type VelocitySensor2Observation {
                                _id: String
                                type: String
                                name: String
                                featureOfInterest: String
                                sensor: Sensor
                                robot: Robot
                                value: [VelocitySensor2ObservationValue]
                            }
                            
                            type VelocitySensor2ObservationValue {
                                x: Int,
y: Int,

                            }
                    
                            input InputVelocitySensor2Observation {
                                _id: String
                                type: String
                                name: String
                                featureOfInterest: String
                                sensor: String
                                robot: String
                                value: InputVelocitySensor2ObservationValue
                            }
                    
                            input InputVelocitySensor2ObservationValue {
                                x: Int,
y: Int,

                    
                            }
                        

                            type VelocitySensor3Observation {
                                _id: String
                                type: String
                                name: String
                                featureOfInterest: String
                                sensor: Sensor
                                robot: Robot
                                value: [VelocitySensor3ObservationValue]
                            }
                            
                            type VelocitySensor3ObservationValue {
                                x: Int,
y: Int,

                            }
                    
                            input InputVelocitySensor3Observation {
                                _id: String
                                type: String
                                name: String
                                featureOfInterest: String
                                sensor: String
                                robot: String
                                value: InputVelocitySensor3ObservationValue
                            }
                    
                            input InputVelocitySensor3ObservationValue {
                                x: Int,
y: Int,

                    
                            }
                        

                            type VelocitySensor4Observation {
                                _id: String
                                type: String
                                name: String
                                featureOfInterest: String
                                sensor: Sensor
                                robot: Robot
                                value: [VelocitySensor4ObservationValue]
                            }
                            
                            type VelocitySensor4ObservationValue {
                                x: Int,
y: Int,

                            }
                    
                            input InputVelocitySensor4Observation {
                                _id: String
                                type: String
                                name: String
                                featureOfInterest: String
                                sensor: String
                                robot: String
                                value: InputVelocitySensor4ObservationValue
                            }
                    
                            input InputVelocitySensor4ObservationValue {
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

                                
                        allAccelorometerSensorObservations(
                            name: String
                        ): [AccelorometerSensorObservation!] !,
                

                        allVelocitySensorObservations(
                            name: String
                        ): [VelocitySensorObservation!] !,
                

                        allVelocitySensor2Observations(
                            name: String
                        ): [VelocitySensor2Observation!] !,
                

                        allVelocitySensor3Observations(
                            name: String
                        ): [VelocitySensor3Observation!] !,
                

                        allVelocitySensor4Observations(
                            name: String
                        ): [VelocitySensor4Observation!] !,
                
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
            
                                    
                        createAccelorometerSensorObservation(
                            input: InputAccelorometerSensorObservation!
                        ): AccelorometerSensorObservation!
                

                        createVelocitySensorObservation(
                            input: InputVelocitySensorObservation!
                        ): VelocitySensorObservation!
                

                        createVelocitySensor2Observation(
                            input: InputVelocitySensor2Observation!
                        ): VelocitySensor2Observation!
                

                        createVelocitySensor3Observation(
                            input: InputVelocitySensor3Observation!
                        ): VelocitySensor3Observation!
                

                        createVelocitySensor4Observation(
                            input: InputVelocitySensor4Observation!
                        ): VelocitySensor4Observation!
                
        }
        `
                        