var fs = require("fs");
const forEach = require('lodash').forEach;
var path = require('path');
var appDir = path.dirname(__dirname);

module.exports = {
    exportContexts() {
        var writeStream = fs.createWriteStream(appDir + "/models/modelexporter.js");
        fs.readdir(appDir + "/models/observations", (err, files) => {
            let importStatements = "";
            let exportStatements = "";
            files.forEach(file => {
                let splitNames = file.replace(".js", "").split("-");
                let observationName = splitNames.map(function (name) {
                    return name.charAt(0).toUpperCase() + name.slice(1)
                }).join("");
                let importStatement = `import ${observationName} from '${appDir}/models/observations/${file}'`
                importStatements += "\n" + importStatement;
                exportStatements += "\n" + observationName + ",";

            });

            writeStream.write(`
        import Robot from '${appDir}/models/robot'
        import Sensor from '${appDir}/models/sensor'
        import Context from '${appDir}/models/context'
            ${importStatements}
        export {
            Robot,
            Sensor,
            Context,
            ${exportStatements}
        };

            `);

            writeStream.end();
        })
    }
}