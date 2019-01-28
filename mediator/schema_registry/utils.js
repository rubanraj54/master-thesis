import { request } from 'graphql-request'

import { createObservationModel } from './observation-model-writer'
import { exportContexts } from './context-exporter'

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
        return request('http://localhost:3086/graphql', mutation)
                .then(data => {
                    return data.createRobot;
                })
                .catch(err => {
                    return err.response;
                })
    },
    
    registerSensor(sensor, dbInfo) {

        // cleanup value_schema object double quotes in keys & change $schema -> schema in key, since graphql don't accept $ sign in key
        let stringValueSchema = JSON.stringify(sensor.value_schema).replace(/\"([^(\")"]+)\":/g, "$1:").replace(/\$schema/g, "schema");
        // cleanup meta object double quotes in keys
        let stringMeta = JSON.stringify(sensor.meta).replace(/\"([^(\")"]+)\":/g, "$1:");
        
        const mutation = `mutation {
                            createSensor(
                                type: "${sensor.type}",
                                name: "${sensor.name}",
                                context: "${sensor.context}",
                                description: "${sensor.description}",
                                measures: "${sensor.measures}",
                                value_schema: ${stringValueSchema},
                                unit: "${sensor.unit}",
                                meta: ${stringMeta}
                            ) {
                                _id
                                name
                            }
                        }`

        return request('http://localhost:3086/graphql', mutation)
                .then(data => {
                    createObservationModel(sensor.name,sensor.value_schema);
                    exportContexts();
                    return data.createSensor;
                })
                .catch(err => {
                    return err.response;
                })
    }

}