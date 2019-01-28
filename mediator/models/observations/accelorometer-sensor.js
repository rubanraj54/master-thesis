
        import mongoose from 'mongoose'

        const AccelorometerSensorObservation = mongoose.model('AccelorometerSensorObservation', {
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

        export default AccelorometerSensorObservation
        