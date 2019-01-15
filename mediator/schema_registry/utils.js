import { request } from 'graphql-request'

module.exports = {
    registerRobot(robot, dbInfo) {
        const mutation = `mutation {
                            createRobot(
                                type:"${robot.type}",
                                name:"${robot.name}",
                                mac_address:"${robot.macAddress}"
                            ) {
                                _id
                                type
                                name
                                mac_address
                            }
                        }`
        return request('http://localhost:3085/graphql', mutation)
                .then(data => {
                    return data.createRobot;
                })
                .catch(err => {
                    return err.response;
                })
    },

    registerSensors(sensors, dbInfo) {
        console.log(sensors, dbInfo);
    },
    
    registerSensor(sensor, dbInfo) {
        console.log(sensor, dbInfo);
    }
}