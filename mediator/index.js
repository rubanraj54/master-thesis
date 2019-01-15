import express from 'express'
import bodyParser from 'body-parser'
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import mongoose from 'mongoose'

import typeDefs from './schema'
import resolvers from './resolver/resolvers'
import Robot from './models/robot'
import Sensor from './models/sensor'
import TemperatureObservation from './models/observations/temperature-observation'
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

const PORT = 3085

const app = express()

app.use(
    '/graphql',
    bodyParser.json(),
    graphqlExpress({
        schema,
        context: {
            Robot,
            Sensor,
            TemperatureObservation
        }
    })
)

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

app.use(express.json());

app.post('/schemaregistry', function (request, response) {
    let data = request.body;
    
    if (!sr.has(data.robot.name).value()) {
        // sr.set(data.robot.name, request.body).write()
        utility.registerRobot(data.robot, data.dbInfo);
        // utility.registerSensors(data.sensors, data.dbInfo);
    } else {

    }

    // sr.unset(data.robot.name).write()
    
    // console.log(request.body); // your JSON
    response.send(data); // echo the result back
});

app.listen(PORT)

console.log(`YASS QUEEN ON PORT: ${PORT}`)


