var fs = require("fs");
var path = require('path');
var appDir = path.dirname(__dirname);

import {
    generateObservationName,
    generateObservationFileName
} from "../general/utils"

module.exports = {

    createMysqlObservationModel(sensorName) {
        let observationName = generateObservationName(sensorName);
        let observationFileName = generateObservationFileName(sensorName);
        
        var writeStream = fs.createWriteStream(appDir + "/models/mysql/observations/" + observationFileName + ".js");

        writeStream.write(`

        const uuid = require('uuid/v4');

        module.exports = (sequelize, Sequelize) => {
            const ${observationName} = sequelize.define('${observationName}', {
                _id: {
                    allowNull: false,
                    primaryKey: true,
                    type: Sequelize.UUID,
                    defaultValue: () => uuid()
                },
                name: Sequelize.STRING,
                type: Sequelize.STRING,
                featureOfInterest: Sequelize.STRING,
                description: Sequelize.STRING,
                value: Sequelize.JSON,
                task: {
                    allowNull: true,
                    type: Sequelize.STRING
                },
                robot: {
                    allowNull: true,
                    type: Sequelize.STRING
                },
                sensor: {
                    allowNull: true,
                    type: Sequelize.STRING
                },
            }, {
                timestamps: false
            })

            return ${observationName};
        }
        `);

        writeStream.end();
    }

}