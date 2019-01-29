
        import mongoose from 'mongoose'

        const VelocitySensor4Observation = mongoose.model('VelocitySensor4Observation', {
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

        export default VelocitySensor4Observation
        