import express from 'express'
import bodyParser from 'body-parser'
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import mongoose from 'mongoose'

import typeDefs from './schema'
import resolvers from './resolver/resolvers'
import Talk from './model'
import Robot from './robotmodel'
const env = require('dotenv').config()

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

// mongoose.connect(
//   `mongodb://${process.env.DB_USER}:${
//     process.env.DB_PASS
//   }@ds042527.mlab.com:42527/awesome-talks`
// )

mongoose.connect('mongodb://localhost:27017/test');


const PORT = 3085

const app = express()

app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress({
      schema,
      context: {
          Talk,
          Robot
      }
  })
)

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

app.listen(PORT)

console.log(`YASS QUEEN ON PORT: ${PORT}`)
