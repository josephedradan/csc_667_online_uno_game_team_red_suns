controllerUsers = {}
const Account = require("../controller/db_engine"); 
function sendUsers(req, res, next) {
    res.send("respond with a resource");
}

function registerUser(req, res, next) {
    console.log("-------In controller_user.registerUser()-------"); 
    console.log("req:");
    console.log(req.body);  
    const {username, password, confirm_password} = req.body; 

    //backend validation;
    const regExpUsername = /^(?![_ -])(?:(?![_ -]{2})[\w -]){5,16}(?<![_ -])$/;
    const regExpPassword = /^(?:(?=.*?\p{N})(?=.*?[\p{S}\p{P} ])(?=.*?\p{Lu})(?=.*?\p{Ll}))[^\p{C}]{8,16}$/; 

    if(username.match(regExpUsername) === null) {
        //TODO: add frontend alert messages to the client. 
        console.log("Improper username, follow 'https://stackoverflow.com/questions/46453307/the-ideal-username-and-password-regex-validation'"); 
        res.render("registration"); 
    } else if(password.match(regExpPassword) === null && password !== confirm_password) {
        //TODO: add frontend alert messages to the client. 
        console.log("Improper password, follow 'https://stackoverflow.com/questions/46453307/the-ideal-username-and-password-regex-validation'");
        res.render("registration");
    } else {
        Account.insertAccount(username, password); 
        res.render("index"); 

    }

}

controllerUsers.sendUsers = sendUsers; 
controllerUsers.registerUser = registerUser; 

module.exports = controllerUsers
