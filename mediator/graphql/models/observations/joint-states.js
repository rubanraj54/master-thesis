
        import mongoose from 'mongoose'
        const uuid = require('uuid/v4');

        const JointStatesObservation = mongoose.model('JointStatesObservation', {
            _id: {
                type: String,
                default: uuid
            },
            name: String,
            type: String,
            featureOfInterest: String,
            task: {
                type: String,
                default: uuid,
                ref: 'Task'
            },
            robot: {
                type: String,
                default: uuid,
                ref: 'Robot'
            },
            sensor: {
                type: String,
                default: uuid,
                ref: 'Sensor'
            },
            value: mongoose.Schema.Types.Mixed,
            phenomenonTime: Date,
            resultTime: Date
        })

        export default JointStatesObservation
        