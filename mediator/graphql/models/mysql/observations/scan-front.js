

        const uuid = require('uuid/v4');

        module.exports = (sequelize, Sequelize,Context) => {
            const ScanFrontObservation = sequelize.define('ScanFrontObservation', {
                _id: {
                    allowNull: false,
                    primaryKey: true,
                    type: Sequelize.UUID,
                    defaultValue: () => uuid()
                },
                name: Sequelize.STRING,
                type: Sequelize.STRING,
                featureOfInterest: Sequelize.STRING,
                description: Sequelize.STRING,
                value: Sequelize.JSON,
                phenomenonTime: Sequelize.DATE,
                resultTime: Sequelize.DATE,
                task: {
                    allowNull: true,
                    type: Sequelize.STRING
                },
                robot: {
                    allowNull: true,
                    type: Sequelize.STRING
                },
                sensor: {
                    allowNull: true,
                    type: Sequelize.STRING
                },
            }, {
                timestamps: false
            })

            ScanFrontObservation.belongsTo(Context);

            return ScanFrontObservation;
        }
        