
                    export default `
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
                        
                allVelocitySensorObservations(
                    name: String
                ): [VelocitySensorObservation!] !,
        

                allAccelorometerSensorObservations(
                    name: String
                ): [AccelorometerSensorObservation!] !,
        
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
    
                            
                createVelocitySensorObservation(
                    input: InputVelocitySensorObservation!
                ): VelocitySensorObservation!
        

                createAccelorometerSensorObservation(
                    input: InputAccelorometerSensorObservation!
                ): AccelorometerSensorObservation!
        
}
`
                