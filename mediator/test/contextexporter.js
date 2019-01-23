var fs = require("fs");
const forEach = require('lodash').forEach;
var writeStream = fs.createWriteStream("modelexporter.js");

fs.readdir("../models/observations", (err, files) => {
    let importStatements = "";
    let exportStatements = "";
    files.forEach(file => {
        let splitNames = file.replace(".js", "").split("-");
        let observationName = splitNames.map(function (name) {
            return name.charAt(0).toUpperCase() + name.slice(1)
        }).join("");
        let importStatement = `import ${observationName} from '../models/observations/${file}'`
        importStatements += "\n" + importStatement;
        exportStatements += "\n" + observationName + ",";
        
    });

    writeStream.write(`
import Robot from '../models/robot'
import Sensor from '../models/sensor'
import Context from '../models/context'
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


