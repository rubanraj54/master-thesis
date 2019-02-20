
// ES5
const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:password@localhost:3308/db');
const Context = require("./models/context")(sequelize,Sequelize);
const Robot = require("./models/robot")(sequelize,Sequelize,Context);

sequelize.sync().then(async () => {
    // let context = await Context.create({ name: 'context1', value: JSON.stringify({'test':'ruban'})});
    // let robot = await Robot.create({ name: 'robot1', type: 'industrial', mac_address: 'xx:xx:xx:xx',description: "dummy text",contextId:"180e5f32-371e-49dc-bea6-7e26b752fbee"});
    // console.log(robot.get({plain:true}));
    let robots = await Robot.findAll({
        raw: true,
        nest: true,
        include: [{
            model: Context,
        }]
    });
    // console.log(JSON.parse(robots[0].context.value).test);
    
}

);

// test(); 

// async function test () {
//     let context = await Context.create({ name: 'context1', value: JSON.stringify({'test':'ruban'})});
//     // let robot = await Robot.create({ name: 'robot1', type: 'industrial', mac_address: 'xx:xx:xx:xx',description: "dummy text",contextId:"41428c55-3e3b-4140-8bce-86f8181d9dca"});
//     // console.log(robot.get({plain:true}));
// }