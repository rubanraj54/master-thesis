import express from 'express'
import bodyParser from 'body-parser'
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import mongoose from 'mongoose'
import typeDefs from './graphqlschemas/newtypedef'
import resolvers from './resolver/resolvers'
import * as Contexts from './models/main'

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const process = require('process');
const mediatorConfigAdapter = new FileSync('mediatorconfig.json')
const mediatorConfig = low(mediatorConfigAdapter)
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

// Url & port initialization
const URL = mediatorConfig.has('url') ? mediatorConfig.get('url').value() : "";
const PORT = mediatorConfig.has('port') ? mediatorConfig.get('port').value() : 8000;

// String.prototype.toObjectId = function () {
//     var ObjectId = (require('mongoose').Types.ObjectId);
//     return new ObjectId(this.toString());
// };

// //checking for mongodb configuration and making connection
// let databases = mediatorConfig.get('db').value();
// let mongoDbIndex = databases.findIndex(database => database.name === "mongodb");
// if (mongoDbIndex != -1) {
//     let mongoDb = databases[mongoDbIndex];
//     let hostWithCredentials = "";
//     if (mongoDb.userName == "" && mongoDb.password == "") {
//         hostWithCredentials = mongoDb.url;
//     } else if (mongoDb.userName == "") {
//         hostWithCredentials = `:${mongoDb.password}@${mongoDb.url}`;;
//     } else if (mongoDb.password == "") {
//         hostWithCredentials = `${mongoDb.userName}:@${mongoDb.url}`;
//     }
//     mongoose.connect(`mongodb://${hostWithCredentials}/${mongoDb.dbName}`,{useNewUrlParser:true});
// } else {
//     console.log("mongodb configuration missing");
// }

const app = express()

// Register and expose graphql access point 
app.use(
    '/graphql',
    bodyParser.json(),
    graphqlExpress({
        schema,
        context: Contexts
    })
)

/*
    Register and expose graphql query user interface
    based on mediator configration 
*/
if (mediatorConfig.get('graphqli').value()) {
    app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))
    console.log(`Graphql query interface is running on port : ${URL}:${PORT}`)
}

// Enable json parsing for the data attached in request body
app.use(express.json());

// Update the graphQl module if there is a change in robot/sensor data
app.get('/restart', function (req, res, next) {
    process.exit(1);
});

// Expose graphQl on port specified in mediator config
app.listen(PORT)

console.log(`Graphql is running on : ${URL}:${PORT}`);


