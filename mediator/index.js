import express from 'express'
import bodyParser from 'body-parser'
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import mongoose from 'mongoose'
import { request } from 'graphql-request'
import { updateGraphQlSchema } from './schema_registry/graphql-schema-updater'

// import typeDefs from './schema'
import typeDefs from './graphqlschemas/newtypedef'
import resolvers from './resolver/resolvers'
import * as Contexts from './models/modelexporter'

const utility = require("./schema_registry/utils.js")
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('schema_registry.json')
const sr = low(adapter)

const env = require('dotenv').config()

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})



mongoose.connect('mongodb://localhost:27017/test',{useNewUrlParser:true});

const PORT = 3086

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
    let data = requestEndpoint.body;
    
    // sr.set(data.robot.name, data).write()
    let req = utility.registerRobot(data.robot, data.dbInfo)

    req.then(res => {
        sr.set(res._id, data).write();
        // sr.set(values[1]._id, data).write();
        // console.log(values[0]);
        let sensorPromises = [];
        data.sensors.forEach(sensor => {
            sensorPromises.push(utility.registerSensor(sensor,data.dbInfo));
        });

        Promise.all(sensorPromises).then(values => {
            // console.log(values);
                    const query = `{
                                            allSensors {
                                                _id,
                                                value_schema,
                                                name
                                            }
                                        }`

            request('http://localhost:3086/graphql', query)
                    .then(data => {
                        console.log(data.allSensors);

                        updateGraphQlSchema(data.allSensors);
                        
                        response.send("Robot and Sensor registry success")
                        // return data.allSensors;
                    })
                    .catch(err => {
                        response.send("all Sensors failed")
                        // return err.response;
                    })
        }).catch(err => {
            console.log(err);
            
            response.send("Sensor registry failed")
        });

    }).catch(err => {
        response.send("Robot registry failed")
        console.log(err);
    })
});

app.listen(PORT)

console.log(`YASS QUEEN ON PORT: ${PORT}`)


