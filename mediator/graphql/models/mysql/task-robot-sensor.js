const uuid = require('uuid/v4');

module.exports = (sequelize, Sequelize) => {
    const TaskRobotSensor = sequelize.define('task_robot_sensor', {
        _id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: () => uuid()
        },
        task: {
            allowNull: false,
            type: Sequelize.UUID,
            defaultValue: () => uuid()
        },
        robot: {
            allowNull: false,
            type: Sequelize.UUID,
            defaultValue: () => uuid()
        },
        sensor: {
            allowNull: false,
            type: Sequelize.UUID,
            defaultValue: () => uuid()
        },
        timestamp: Sequelize.DATE,
    }, {
        timestamps: false
    })

    TaskRobotSensor.belongsTo(Task);
    TaskRobotSensor.belongsTo(Robot);
    TaskRobotSensor.belongsTo(Sensor);

    return TaskRobotSensor;
}