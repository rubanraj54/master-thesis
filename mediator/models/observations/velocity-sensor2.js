
        import mongoose from 'mongoose'

        const VelocitySensor2Observation = mongoose.model('VelocitySensor2Observation', {
            name: String,
            type: String,
            featureOfInterest: String,
            sensor: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Sensor'
            },
            robot: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Robot'
            },
            value: [{x:Number,y:Number}]
        })

        export default VelocitySensor2Observation
        