const controllerUsers = {};

const dbEngine = require('./db_engine');

function getUsers(req, res, next) {
    res.send('respond with a resource');
}

module.exports = controllerUsers;
