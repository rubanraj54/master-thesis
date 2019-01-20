var djvi = require("djvi");

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
console.log(env.instance('test#'));
 
// => { type: 'common' }