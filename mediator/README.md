
# Master thesis (Mediator component)

## Requirements:

Node : v8.11.1

npm : 6.4.1

mongodb 

Note: Before running mediator make sure the data sources are up and running for storing or fetching.

## Instruction to spinup mongodb docker container

Simple setup:
 ```
$ docker run -d --name robomongo -p 27017:27017 mvertes/alpine-mongo
```

Mounting data location from host to container: (preferred)

```
$ docker run -d --name mongo -p 27017:27017 \
  -v /somewhere/onmyhost/mydatabase:/data/db \
  mvertes/alpine-mongo
```
## Instructions to run mediator:

 1. Clone the repository
 2. Go to /mediator folder
 3. Run command "`npm install`" to install dependencies
 4. Run command "`npm run watch`" to start mediator
 5. Now you can access graphqli web interface under  "http://localhost:3085/graphiql"

Initial Robot, Sensor registration configuration file,
```javascript
{
    "robot": {
        "name": "newrobot",
        "type": "schema:robot",
        "macAddress": "dd:3e:4d:5s",
        "context": "5c4f5bacdb878529d8999978"
    },
    "sensors": [
        {
            "type": "schema:Sensor",
            "name": "velocity_sensor9",
            "context": "5c4f5b7bdb878529d8999977",
            "description": "Sensor to measure the internal temperature of the robot",
            "measures": "heat",
            "value_schema": {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "values": {
                        "type": "array",
                        "items": [
                            {
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
                            }
                        ]
                    }
                },
                "required": [
                    "values"
                ]
            },
            "unit": "Celcius",
            "meta": {
            	"test" : "123"
            }
        }
    ]
}
```
