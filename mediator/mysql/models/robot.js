const uuid = require('uuid/v4');

module.exports = (sequelize, Sequelize, Context) => {
    const Robot = sequelize.define('robots', {
        _id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: () => uuid()
        },
        name: Sequelize.STRING,
        type: Sequelize.STRING,
        mac_address: Sequelize.STRING,
        description: Sequelize.STRING,
    }, {
        timestamps: false
    })

    Robot.belongsTo(Context);

    return Robot;
}