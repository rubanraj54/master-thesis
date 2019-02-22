const uuid = require('uuid/v4'); 

module.exports = (sequelize, Sequelize) => {
    const Context = sequelize.define('contexts', {
        _id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: () => uuid()
          },
        name: Sequelize.STRING,
        value: Sequelize.JSON
      }, {
          timestamps:false
      })
    //   Context.sync();
    return Context;
  }