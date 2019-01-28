var fs = require("fs");
var djvi = require("djvi");
var path = require('path');
var appDir = path.dirname(__dirname);

const forEach = require('lodash').forEach;

module.exports = {

    createObservationModel(observationName, jsonSchema) {
        var writeStream = fs.createWriteStream(appDir + "/models/observations/" + observationName + ".js");
        
        var env = new djvi();
        env.addSchema('test', jsonSchema);
        
        let model = env.instance('test#');
        let transformedValue = "";
        let value = (Array.isArray(model.values)) ? model.values[0] : model.values;
        let mongooseModel = {};
        
        forEach(value, (element, key) => {
            if (Array.isArray(element) || typeof element == "object") {
                return false;
            }
            let type = "String";
            if (typeof element == "number" || typeof element == "integer") {
                type = "Number";
            } else if (typeof element == "boolean") {
                type = "Boolean";
            }
            mongooseModel[key] = type;
        })
        
        transformedValue = JSON.stringify(mongooseModel).replace(/["']/g, "");
        
        if (Array.isArray(model.values)) {
            transformedValue = "[" + transformedValue + "]"
        }

        writeStream.write(`
        import mongoose from 'mongoose'

        const ${observationName} = mongoose.model('${observationName}', {
            name: String,
            type: String,
            featureOfInterest: String,
            sensor: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Sensor'
            },
            robot: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Robot'
            },
            value: ${transformedValue}
        })

        export default ${observationName}
        `);

        writeStream.end();
    }

}