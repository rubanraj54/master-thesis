const uuid = require('uuid/v4');

module.exports = (sequelize, Sequelize, Context) => {
    const Sensor = sequelize.define('sensors', {
        _id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: () => uuid()
        },
        name: Sequelize.STRING,
        type: Sequelize.STRING,
        description: Sequelize.STRING,
        value_schema: Sequelize.JSON,
        unit: Sequelize.STRING,
        meta: Sequelize.JSON,
    }, {
        timestamps: false
    })

    Sensor.belongsTo(Context);

    return Sensor;
}