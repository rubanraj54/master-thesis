# master thesis (Mediator component)

## Requirements:

Node : v8.11.1

npm : 6.4.1

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
    "type":"schema:robot",
    "macAddress":"dd:3e:4d:5s",
    "context":"5c3f5b4dec9325165bad9b95"
  },
  "sensors": [
    {
      "type": "schema:Sensor",
      "name": "newsensor",
      "context": "5c3f5b65ec9325165bad9b96",
      "description": "Sensor to measure the internal temperature of the robot",
      "measures": "heat",
      "value_schema": "schemaUrl:23764732647sdugf32u32g",
      "unit": "Celcius",
      "meta": {}
    }
  ]
}
```
