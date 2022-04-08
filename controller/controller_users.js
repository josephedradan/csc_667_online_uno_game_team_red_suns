controllerUsers = {}

function sendUsers(req, res, next) {
    res.send("respond with a resource");
}
controllerUsers.sendUsers = sendUsers

module.exports = controllerUsers
