import express from 'express'
import bodyParser from 'body-parser'
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import mongoose from 'mongoose'
import { request } from 'graphql-request'
import { updateGraphQlSchema } from './schema_registry/graphql-schema-updater'
import { updateGraphQlQuery } from './schema_registry/graphql-query-updater'
import { updateGraphQlMutation } from './schema_registry/graphql-mutation-updater'

// import typeDefs from './schema'
import typeDefs from './graphqlschemas/newtypedef'
import resolvers from './resolver/resolvers'
import * as Contexts from './models/main'

const utility = require("./schema_registry/utils.js")
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('schema_registry.json')
const sr = low(adapter)


import findIndex from 'lodash/findIndex'

console.log();

if (!sr.has('robots').value()) {
    sr.set('robots', []).write()
}
if (!sr.has('sensors').value()) {
    sr.set('sensors', []).write()
}


const env = require('dotenv').config()

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})



mongoose.connect('mongodb://localhost:27017/test',{useNewUrlParser:true});

const PORT = 3085

const app = express()

app.use(
    '/graphql',
    bodyParser.json(),
    graphqlExpress({
        schema,
        context: Contexts
    })
)

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

app.use(express.json());


app.post('/schemaregistry/', function (requestEndpoint, response) {
    let finalResponse = {
        robot: {
            name: "",
            id: ""
        },
        sensors: []
    };
    let data = requestEndpoint.body;
    let robot = data.robot;
    let robots = sr.get('robots').value();
    let robotIndexInRegistry = robots.findIndex(_robot => _robot.name === robot.name);
    if (robot && robotIndexInRegistry == -1) {
        let req = utility.registerRobot(data.robot, data.dbInfo)
    
        req.then(res => {
            let newRobot = {
                id: res._id,
                name: data.robot.name,
            }

            sr.get('robots').push(newRobot).write();
            finalResponse.robot.id = res._id;
            finalResponse.robot.name = data.robot.name;

            let existingSensors = sr.get('sensors').value();
            let sensorPromises = [];
            data.sensors.forEach(sensor => {
                let sensorIndexInRegistry = existingSensors.findIndex(existingSensor => existingSensor.name === sensor.name);
                if (sensorIndexInRegistry == -1) {
                    sensorPromises.push(utility.registerSensor(sensor,data.dbInfo));
                } else {
                    let existingSensor = existingSensors[sensorIndexInRegistry];
                    finalResponse.sensors.push({
                        id: existingSensor.id,
                        name: existingSensor.name
                    });
                    console.log(sensor.name, ' already exits');
                }
            });
            if (sensorPromises.length != 0) {
                Promise.all(sensorPromises).then(values => {
                    values.forEach(value => {
                        let newSensor = {
                            id: value._id,
                            name: value.name,
                        }
                        sr.get('sensors').push(newSensor).write();
                        finalResponse.sensors.push({
                            id: value._id,
                            name: value.name
                        });
                    });       
                    const query = `{
                                        allSensors {
                                            _id,
                                            value_schema,
                                            name
                                        }
                                    }`
        
                    request('http://localhost:3085/graphql', query)
                            .then(data => {
                                // console.log(data.allSensors);
        
                                updateGraphQlSchema(data.allSensors);
                                updateGraphQlQuery(data.allSensors);
                                updateGraphQlMutation(data.allSensors);
                                response.json(finalResponse);
                            })
                            .catch(err => {
                                response.send("all Sensors failed")
                            })
                }).catch(err => {
                    console.log(err);
                    response.send("Sensor registry failed")
                });
            } else {
                response.json(finalResponse);
            }
        }).catch(err => {
            response.send("Robot registry failed")
            console.log(err);
        })
    } else if (robotIndexInRegistry > -1) {
        let existingRobot = robots[robotIndexInRegistry];
        finalResponse.robot.id = existingRobot.id;
        finalResponse.robot.name = existingRobot.name;
        let existingSensors = sr.get('sensors').value();
        let sensorPromises = [];
        data.sensors.forEach(sensor => {
            let sensorIndexInRegistry = existingSensors.findIndex(existingSensor => existingSensor.name === sensor.name);
            if (sensorIndexInRegistry == -1) {
                sensorPromises.push(utility.registerSensor(sensor, data.dbInfo));
            } else {
                let existingSensor = existingSensors[sensorIndexInRegistry];
                finalResponse.sensors.push({
                    id: existingSensor.id,
                    name: existingSensor.name
                });
                console.log(sensor.name, ' already exits');
            }
        });
        if (sensorPromises.length != 0) {
            Promise.all(sensorPromises).then(values => {
                // let existingSensors = sr.get('robots').find({ name: newRobot.name }).sensors
                values.forEach(value => {
                    let newSensor = {
                        id: value._id,
                        name: value.name,
                    }
                    sr.get('sensors').push(newSensor).write();
                    finalResponse.sensors.push({
                        id: value._id,
                        name: value.name
                    });
                });
                const query = `{
                                    allSensors {
                                        _id,
                                        value_schema,
                                        name
                                    }
                                }`
    
                request('http://localhost:3085/graphql', query)
                    .then(data => {
                        // console.log(data.allSensors);
    
                        updateGraphQlSchema(data.allSensors);
                        updateGraphQlQuery(data.allSensors);
                        updateGraphQlMutation(data.allSensors);
                        response.json(finalResponse);
                    })
                    .catch(err => {
                        response.send("all Sensors failed")
                    })
            }).catch(err => {
                console.log(err);
                response.send("Sensor registry failed")
            });
        } else {
            response.json(finalResponse);
        }
    }
});

app.listen(PORT)

console.log(`YASS QUEEN ON PORT: ${PORT}`)


