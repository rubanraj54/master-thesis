const Sequelize = require('sequelize');

module.exports = {
    makeMysqlConnection(mysql) {
        let hostWithCredentials = "";
        if (mysql.userName == "" && mysql.password == "") {
            hostWithCredentials = mysql.url;
        } else if (mysql.userName == "") {
            hostWithCredentials = `:${mysql.password}@${mysql.url}`;;
        } else if (mysql.password == "") {
            hostWithCredentials = `${mysql.userName}:@${mysql.url}`;
        } else {
            hostWithCredentials = `${mysql.userName}:${mysql.password}@${mysql.url}`;
        }
        return new Sequelize(`mysql://${hostWithCredentials}/${mysql.dbName}`);
    }
}