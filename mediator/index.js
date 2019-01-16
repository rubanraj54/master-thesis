import express from 'express'
import bodyParser from 'body-parser'
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import mongoose from 'mongoose'

import typeDefs from './schema'
import resolvers from './resolver/resolvers'
import Robot from './models/robot'
import Sensor from './models/sensor'
import Context from './models/context'
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
            Context,
            TemperatureObservation
        }
    })
)

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

app.use(express.json());

app.post('/schemaregistry/', function (request, response) {
    let data = request.body;
    
    // sr.set(data.robot.name, data).write()
    let req = utility.registerRobot(data.robot, data.dbInfo)
    // let req2 = utility.registerRobot(data.robot, data.dbInfo)
    let promisearray = Promise.all([req]);
    promisearray.then(values => {
        sr.set(values[0]._id, data).write();
        // sr.set(values[1]._id, data).write();
        console.log(values[0]);
        response.send("Success")
    }).catch(err => {
        response.send("Robot registry failed")
        console.log(err);
    })
});

app.listen(PORT)

console.log(`YASS QUEEN ON PORT: ${PORT}`)


