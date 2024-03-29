var fs = require("fs");
var djvi = require("djvi");
var path = require('path');
var appDir = path.dirname(__dirname);

const forEach = require('lodash').forEach;


import {
    generateObservationName,
    generateObservationFileName
} from "../general/utils"

module.exports = {

    createObservationModel(sensorName) {
        let observationName = generateObservationName(sensorName);
        let observationFileName = generateObservationFileName(sensorName);
        
        var writeStream = fs.createWriteStream(appDir + "/models/observations/" + observationFileName + ".js");

        writeStream.write(`
        import mongoose from 'mongoose'
        const uuid = require('uuid/v4');
        
        module.exports = (connection) => {
            const ${observationName} = connection.model('${observationName}', {
                _id: {
                    type: String,
                    default: uuid
                },
                name: String,
                type: String,
                featureOfInterest: String,
                task: {
                    type: String,
                    default: uuid,
                    ref: 'Task'
                },
                robot: {
                    type: String,
                    default: uuid,
                    ref: 'Robot'
                },
                sensor: {
                    type: String,
                    default: uuid,
                    ref: 'Sensor'
                },
                value: mongoose.Schema.Types.Mixed,
                phenomenonTime: Date,
                resultTime: Date
            })

            return ${observationName};
        }
        `);

        writeStream.end();
    }

}