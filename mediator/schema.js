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
    value_schema: String
    meta: JSON
    context: Context
}

type Context {
  _id: String
  name: String
  value: JSON
}

type TemperatureObservation {
  _id: String
  type: String
  name: String
  featureOfInterest: String
  sensor: Sensor
  robot: Robot
  value: TemperatureObservationValue
}

type AccelerometerObservation {
  _id: String
  value: [AccelerometerObservationValue]
}

type TemperatureObservationValue {
  x: Int,
  y: Int,
  z: Int
}

type AccelerometerObservationValue {
        x: Int,
        y: Int,
        z: Int
}

input InputTemperatureObservation {
  _id: String
  type: String
  name: String
  featureOfInterest: String
  sensor: String
  robot: String
  value: InputTemperatureObservationValue
}

input InputTemperatureObservationValue {
    x: Int,
    y: Int,
    z: Int
}

type Query {

allRobots(
    name: String,
    mac_address: String,
  ): [Robot!]!,

allSensors(
    name: String
  ): [Sensor!] !,

allTemperatureObservations(
    name: String
  ): [TemperatureObservation!] !,

allAccelerometerObservations(
    name: String
  ): [AccelerometerObservation!] !,
  
allContexts(
    name: String
  ): [Context!] !,

  getRobot(
    id: String!
  ): Robot!
}

type Mutation {

    createRobot(
        type: String!,
        name : String!,
        mac_address : String!,
        context : String!,
        ): Robot!
        
    createSensor(
        type: String!,
        name : String!,
        description: String!,
        measures: String!,
        value_schema: String!,
        unit: String!,
        meta: JSON!,
        context : String!,
    ): Sensor!

    createContext(
        name: String!
        value: JSON!,
    ): Context!

    createTemperatureObservation(
        input:InputTemperatureObservation!
    ): TemperatureObservation!

}

`