import { makeMongoDBConnection } from '../DbConnectionConnector/mongodb';
import { makeMysqlConnection } from '../DbConnectionConnector/mysql';

module.exports = {

    generateObservationName(sensorName) {
        let names = sensorName.replace(/\s+/g, '_').split('_');

        let observationName = names.map(function (name) {
            return name.charAt(0).toUpperCase() + name.slice(1)
        }).join("");

        return observationName + "Observation";
    } ,
    generateObservationFileName(sensorName) {
        let names = sensorName.replace(/\s+/g, '_').split('_');

        let observationFileName = names.map(function (name) {
            return name.toLowerCase()
        }).join("-");

        return observationFileName;
    } ,

    makeConnectionPool(dbConfigs,dbName) {
        let connectionPool = [];
        dbConfigs.forEach(dbConfig => {
            if (dbConfig.type != dbName) return;
            let connection = null;
            if (dbName == "mysql") {
                connection = makeMysqlConnection(dbConfig);
            } else if (dbName == "mongodb") {
                connection = makeMongoDBConnection(dbConfig);
            }
            connectionPool.push({
                name: dbConfig.name,
                connection 
            });
        });
        return connectionPool;
    } ,

    getConnection(connectionPool,dbName,entityName) {

        let poolIndex = connectionPool.findIndex(connection => {
            return connection.name === dbName
        });
        
        if (poolIndex > -1) {
            return connectionPool[poolIndex].connection;
        } else {
            console.log(`${entityName} DB config not found`);
            process.exit();
        }
    }

}