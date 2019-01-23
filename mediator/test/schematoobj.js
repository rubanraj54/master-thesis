var djvi = require("djvi");
const forEach = require('lodash').forEach;

var jsonSchema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "properties": {
        "values": {
            "type": "array",
            "items": [{
                "type": "object",
                "properties": {
                    "x": {
                        "type": "integer"
                    },
                    "y": {
                        "type": "integer"
                    }
                },
                "required": [
                    "x",
                    "y"
                ]
            }]
        }
    },
    "required": [
        "values"
    ]
};

var env = new djvi();
env.addSchema('test', jsonSchema);
let model = env.instance('test#');
console.log(Array.isArray(model.values));

if (Array.isArray(model.values)) {
    let value = model.values[0];
    let mongooseModel = {};
    forEach(value,(element,key) => {
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
    console.log(JSON.stringify(mongooseModel).replace(/["']/g, ""));
    
    // Object.entries(value).forEach(([element,key]) => {
    // });
} else {

}