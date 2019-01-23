import { request } from 'graphql-request'

module.exports = {
    registerRobot(robot, dbInfo) {
        const mutation = `mutation {
                            createRobot(
                                type:"${robot.type}",
                                name:"${robot.name}",
                                mac_address:"${robot.macAddress}"
                                context:"${robot.context}"
                            ) {
                                _id
                                type
                                name
                                mac_address,
                                context {
                                    value
                                }
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
        const mutation = `mutation {
                            createSensor(
                                type: "${sensor.type}",
                                name: "${sensor.name}",
                                context: "${sensor.context}",
                                description: "${sensor.description}",
                                measures: "${sensor.measures}",
                                value_schema: "${sensor.value_schema}",
                                unit: "${sensor.unit}",
                                meta: ${sensor.meta}
                            ) {
                                _id
                                name
                            }
                        }`
        return request('http://localhost:3085/graphql', mutation)
                .then(data => {
                    return data.createSensor;
                })
                .catch(err => {
                    return err.response;
                })
        console.log(sensor, dbInfo);
    }

}