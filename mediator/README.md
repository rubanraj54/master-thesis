
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
    "task": {
        "name": "testone",
        "env": "house",
        "context": "5c4f6a3700c3d43fa87954ce"
    },
    "robots": [{
            "name": "Robot2",
            "type": "schema:robot",
            "mac_address": "s3:34:fd:7f",
            "context": "5c6bf2e7d80174002302ddca",
            "sensors": [{
                "type": "schema:Sensor",
                "name": "Odometer",
                "description": "An instrument for measuring the distance travelled by a wheeled vehicle.",
                "measures": "Distance",
                "value_schema": {
                    "$schema": "http://json-schema.org/draft-04/schema#",
                    "type": "object",
                    "properties": {
                      "angular_x": {
                        "type": "number"
                      },
                      "angular_y": {
                        "type": "number"
                      },
                      "angular_z": {
                        "type": "number"
                      },
                      "linear_x": {
                        "type": "number"
                      },
                      "linear_y": {
                        "type": "number"
                      },
                      "linear_z": {
                        "type": "number"
                      },
                      "orientation_w": {
                        "type": "number"
                      },
                      "orientation_x": {
                        "type": "number"
                      },
                      "orientation_y": {
                        "type": "number"
                      },
                      "orientation_z": {
                        "type": "number"
                      },
                      "position_x": {
                        "type": "number"
                      },
                      "position_y": {
                        "type": "number"
                      },
                      "position_z": {
                        "type": "number"
                      },
                      "timestamp": {
                        "type": "number"
                      }
                    },
                    "required": [
                      "angular_x",
                      "angular_y",
                      "angular_z",
                      "linear_x",
                      "linear_y",
                      "linear_z",
                      "orientation_w",
                      "orientation_x",
                      "orientation_y",
                      "orientation_z",
                      "position_x",
                      "position_y",
                      "position_z",
                      "timestamp"
                    ]
                  },
                "unit": "meter",
                "meta": {
                    "device_name": "max"
                },
                "isNewBucket": false
            }, {
                "type": "schema:Sensor",
                "name": "Command_Velocity",
                "description": "Measures the velocity of the robot",
                "measures": "velocity",
                "value_schema": {
                    "$schema": "http://json-schema.org/draft-04/schema#",
                    "type": "object",
                    "properties": {
                      "angular_x": {
                        "type": "number"
                      },
                      "angular_y": {
                        "type": "number"
                      },
                      "angular_z": {
                        "type": "number"
                      },
                      "linear_x": {
                        "type": "number"
                      },
                      "linear_y": {
                        "type": "number"
                      },
                      "linear_z": {
                        "type": "number"
                      },
                      "timestamp": {
                        "type": "number"
                      }
                    },
                    "required": [
                      "angular_x",
                      "angular_y",
                      "angular_z",
                      "linear_x",
                      "linear_y",
                      "linear_z",
                      "timestamp"
                    ]
                  },
                "unit": "Meter per second",
                "meta": {
                    "manufacturer": "Tesla"
                },
                "isNewBucket": false
            }]
        },
        {
            "name": "newrobot44",
            "type": "schema:robot",
            "mac_address": "dd:3e:4d:5s",
            "context": "5c6bf2e7d80174002302ddca",
            "sensors": [{
                "type": "schema:Sensor",
                "name": "Joint states",
                "description": "Measures the joing states",
                "measures": "Joint states",
                "value_schema": {
                    "$schema": "http://json-schema.org/draft-04/schema#",
                    "type": "object",
                    "properties": {
                        "effort": {
                            "type": "array",
                            "items": {
                                "type": "number"
                            }
                        },
                        "frame_id": {
                            "type": "string"
                        },
                        "name": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        },
                        "position": {
                            "type": "array",
                            "items": {
                                "type": "number"
                            }
                        },
                        "timestamp": {
                            "type": "number"
                        },
                        "velocity": {
                            "type": "array",
                            "items": {
                                "type": "number"
                            }
                        }
                    },
                    "required": [
                        "effort",
                        "frame_id",
                        "name",
                        "position",
                        "timestamp",
                        "velocity"
                    ]
                },
                "unit": "Position",
                "meta": {
                    "device_name": "bingo"
                },
                "isNewBucket": false
            }, {
                "type": "schema:Sensor",
                "name": "Scan_front",
                "description": "Scanner mounted on the front side of the robot",
                "measures": "area",
                "value_schema": {
                    "definitions": {},
                    "$schema": "http://json-schema.org/draft-07/schema#",
                    "type": "object",
                    "title": "The Root Schema",
                    "required": [
                        "angle_increment",
                        "angle_max",
                        "angle_min",
                        "frame_id",
                        "range_max",
                        "range_min",
                        "ranges",
                        "scan_time",
                        "time_increment",
                        "timestamp"
                    ],
                    "properties": {
                        "angle_increment": {
                            "type": "number",
                            "title": "The Angle_increment Schema",
                            "default": 0.0
                        },
                        "angle_max": {
                            "type": "number",
                            "title": "The Angle_max Schema",
                            "default": 0.0
                        },
                        "angle_min": {
                            "type": "number",
                            "title": "The Angle_min Schema",
                            "default": 0.0
                        },
                        "frame_id": {
                            "type": "string",
                            "title": "The Frame_id Schema",
                            "default": "",
                            "pattern": "^(.*)$"
                        },
                        "range_max": {
                            "type": "number",
                            "title": "The Range_max Schema",
                            "default": 0.0
                        },
                        "range_min": {
                            "type": "number",
                            "title": "The Range_min Schema",
                            "default": 0.0
                        },
                        "ranges": {
                            "type": "array",
                            "title": "The Ranges Schema",
                            "items": {
                                "type": "number",
                                "title": "The Items Schema",
                                "default": 0.0
                            }
                        },
                        "scan_time": {
                            "type": "number",
                            "title": "The Scan_time Schema",
                            "default": 0.0
                        },
                        "time_increment": {
                            "type": "number",
                            "title": "The Time_increment Schema",
                            "default": 0.0
                        },
                        "timestamp": {
                            "type": "number",
                            "title": "The Timestamp Schema",
                            "default": 0.0
                        }
                    }
                },
                "unit": "null",
                "meta": {
                    "manufacturer": "Leica geosystems"
                },
                "isNewBucket": true
            }]
        }
    ]
}
```
