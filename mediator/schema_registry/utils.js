import { request } from 'graphql-request'

module.exports = {
    registerRobot(robot, dbInfo) {
        const mutation = `mutation {
  createTemperatureObservation(input: {
    type:"schema:observation",
    						name:"observation",
    						featureOfInterest:"dssdf",
    sensor:"5c361d5cbcdd6b5484f057e5",
    robot:"5c35d6aefe64386c54818bb4",
    value:{x:2333,y:2,z:3}
  }) {
    _id,
    type,
    name,value{
      x
      y
      z
    }
  }
}`
        request('http://localhost:3085/graphql', mutation).then(data => {
            console.log('data');
            
            console.log(data)
        }
        ).catch(err => {
            console.log('error');
            console.log(err.response.errors) // GraphQL response errors
            console.log(err.response.data) // Response data if available
        })
    },

    registerSensors(sensors, dbInfo) {
        console.log(sensors, dbInfo);
    },
    
    registerSensor(sensor, dbInfo) {
        console.log(sensor, dbInfo);
    }
}