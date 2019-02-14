require('babel-register')({
    presets: ['env'],
    "plugins": [
        ["transform-runtime", {
            "polyfill": false,
            "regenerator": true
        }]
    ]
})

// Import the rest of our application.
module.exports = require('./index.js')