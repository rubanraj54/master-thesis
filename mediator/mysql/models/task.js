const uuid = require('uuid/v4');

module.exports = (sequelize, Sequelize, Context) => {
    const Task = sequelize.define('tasks', {
        _id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: () => uuid()
        },
        name: Sequelize.STRING
    }, {
        timestamps: false
    })

    Task.belongsTo(Context);

    return Task;
}