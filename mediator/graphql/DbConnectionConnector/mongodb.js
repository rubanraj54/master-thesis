import mongoose from 'mongoose'

module.exports = {
    makeMongoDBConnection(mongoDb) {
        let hostWithCredentials = "";
        if (mongoDb.userName == "" && mongoDb.password == "") {
            hostWithCredentials = mongoDb.url;
        } else if (mongoDb.userName == "") {
            hostWithCredentials = `:${mongoDb.password}@${mongoDb.url}`;
        } else if (mongoDb.password == "") {
            hostWithCredentials = `${mongoDb.userName}:@${mongoDb.url}`;
        }
        return mongoose.createConnection(`mongodb://${hostWithCredentials}/${mongoDb.dbName}`, {
            useNewUrlParser: true
        });
    }

}