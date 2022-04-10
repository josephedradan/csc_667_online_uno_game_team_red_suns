const db = require("../db");
const bcrypt = require("bcrypt");

controllerUsers = {}

// FIXME INCONSISTENT NAMING FOR DB TABLE Account AND FUNCTION NAME User
controllerUsers.getUsers = (req, res, next) => {
    res.send("respond with a resource");
}

// FIXME INCONSISTENT NAMING FOR DB TABLE Account AND FUNCTION NAME User
// FIXME: VALIDATION IS DONE BY MIDDLEWARE
// FIXME: REGISTRATION IS IN controller_index, SO REMOVE THIS FUNCTION
controllerUsers.registerUser = (req, res, next) => {

    console.log("-------In controller_user.registerUser()-------");
    console.log("req:");
    console.log(req.body);
    const {username, password, confirm_password} = req.body;

    //backend validation;
    const regExpUsername = /^(?![_ -])(?:(?![_ -]{2})[\w -]){5,16}(?<![_ -])$/;
    const regExpPassword = /^(?:(?=.*?\p{N})(?=.*?[\p{S}\p{P} ])(?=.*?\p{Lu})(?=.*?\p{Ll}))[^\p{C}]{8,16}$/;

    if (username.match(regExpUsername) === null) {
        //TODO: add frontend alert messages to the client.
        console.log("Improper username, follow 'https://stackoverflow.com/questions/46453307/the-ideal-username-and-password-regex-validation'");
        res.render("registration");
    } else if (password.match(regExpPassword) === null && password !== confirm_password) {
        //TODO: add frontend alert messages to the client.
        console.log("Improper password, follow 'https://stackoverflow.com/questions/46453307/the-ideal-username-and-password-regex-validation'");
        res.render("registration");
    } else {


        function insertUser(username, password) {
            //TODO: insert user into the database.

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, async (err, hash) => {
                    if (err) {
                        console.log("err in hashing");
                        return;
                    }
                    // Store hash in your password DB.
                    console.log(username + ":" + hash + ":" + password);
                    await db.any(
                        `
                        INSERT INTO public."Account"(
                            username, password)
                        VALUES ('${username}', '${hash}');
                
                        INSERT INTO public."Account Statistics"(
                            "num_Wins", "num_Loss")
                        VALUES (0, 0);
                        `
                    )


                });
            })
        }

        insertUser(username, password);
        res.render("index");

    }

}


module.exports = controllerUsers
