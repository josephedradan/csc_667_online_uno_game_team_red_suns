controllerUsers = {}

function sendUsers(req, res, next) {
    res.send("respond with a resource");
}

function registerUser(req, res, next) {
    console.log("Hi"); 
    console.log("req:");
    console.log(req.body);  
    res.render("index"); 
}

controllerUsers.sendUsers = sendUsers; 
controllerUsers.registerUser = registerUser; 

module.exports = controllerUsers
