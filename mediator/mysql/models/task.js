const uuid = require('uuid/v4');

module.exports = (sequelize, Sequelize, Context) => {
    const Task = sequelize.define('tasks', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: uuid()
        }
    }, {
        timestamps: false
    })

    Task.belongsTo(Context);

    return Task;
}