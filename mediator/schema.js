export default `

scalar JSON

type Robot {
  _id: String
  type: String
  name: String
  mac_address: String
}

type Sensor {
  _id: String
  type: String
  name: String
  description: String
  measures: String
  value_schema: String
  meta: JSON
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

type TemperatureObservationValue {
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

  getRobot(
    id: String!
  ): Robot!
}

type Mutation {

    createRobot(
        type: String!,
        name : String!,
        mac_address : String!,
    ): Robot!

    createSensor(
        type: String!,
        name : String!,
        description: String!,
        measures: String!,
        value_schema: String!,
        meta: JSON!,
    ): Sensor!

    createTemperatureObservation(
        input:InputTemperatureObservation!
    ): TemperatureObservation!

}

`