controllerUsers = {}

function sendUsers(req, res, next) {
    res.send("respond with a resource");
}

function register(req, res, next) {
    console.log("Hi"); 
}

controllerUsers.sendUsers = sendUsers; 
controllerUsers.register = register; 

module.exports = controllerUsers; 
