var fs = require("fs");
const forEach = require('lodash').forEach;
var path = require('path');
var appDir = path.dirname(__dirname);

module.exports = {
    exportContexts() {
        var writeStream = fs.createWriteStream(appDir + "/models/main.js");
        fs.readdir(appDir + "/models/observations", (err, files) => {
            let importStatements = "";
            let exportStatements = "";
            files.forEach(file => {
                let splitNames = file.replace(".js", "").split("-");
                let observationName = splitNames.map(function (name) {
                    return name.charAt(0).toUpperCase() + name.slice(1)
                }).join("");
                observationName += "Observation";
                let importStatement = `import ${observationName} from './observations/${file}'`
                importStatements += "\n" + importStatement;
                exportStatements += "\n" + observationName + ",";
            });

            writeStream.write(`
        import Task from './task'
        import Robot from './robot'
        import Sensor from './sensor'
        import Context from './context'
        import TaskRobotSensor from './task-robot-sensor'
            ${importStatements}
        export {
            Task,
            Robot,
            Sensor,
            Context,
            TaskRobotSensor,
            ${exportStatements}
        };

            `);

            writeStream.end();
        })
    }
}