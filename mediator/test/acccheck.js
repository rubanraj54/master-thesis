const mongoose = require('mongoose');
const AccelerometerObservation = require('../models/observations/');

mongoose.connect('mongodb://localhost:27017/test', {
    useNewUrlParser: true
});
