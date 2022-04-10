const db = require("../db/index");
const dbEngine = require("./db_engine");
const passwordHandler = require("./handler_password");

const debugPrinter = require('../util/debug_printer');

async function logOut(req, res, next) {
    // Get username (It will not exist in the session once you logout)
    const {username} = req.user;

    // Will log out user (this functionality is handled by the passport package)
    req.logOut();

    // Remove the session of the user
    req.session.destroy();

    // Clear the users cookies
    res
        .status(200)
        .clearCookie('connect.sid')
        // .json({
        //     status: 'success',
        //     message: `${username} has logged out`,
        // })
        .render("index");
}

/* ############################################################################################################## */

const controllerIndex = {}

controllerIndex.renderIndex = (req, res, next) => {
    res.render("index", {title: "CSC 667 Express"})
}

controllerIndex.renderRegistration = async (req, res, next) => {

    debugPrinter.printBackendGreen("-------In controller_index.registerUser()-------");
    console.log("req:");
    console.log(req.body);

    const {
        username,
        password,
        confirm_password
    } = req.body;

    // TODO: VALIDATION IS ALREADY HANDLED BY MIDDLEWARE
    // //backend validation;
    // const regExpUsername = /^(?![_ -])(?:(?![_ -]{2})[\w -]){5,16}(?<![_ -])$/;
    // const regExpPassword = /^(?:(?=.*?\p{N})(?=.*?[\p{S}\p{P} ])(?=.*?\p{Lu})(?=.*?\p{Ll}))[^\p{C}]{8,16}$/;
    //
    // if(username.match(regExpUsername) === null) {
    //     //TODO: add frontend alert messages to the client.
    //     console.log("Improper username, follow 'https://stackoverflow.com/questions/46453307/the-ideal-username-and-password-regex-validation'");
    //     res.render("registration", {title: "Registration Page"});
    // } else if(password.match(regExpPassword) === null && password !== confirm_password) {
    //     //TODO: add frontend alert messages to the client.
    //     console.log("Improper password, follow 'https://stackoverflow.com/questions/46453307/the-ideal-username-and-password-regex-validation'");
    //     res.render("registration", {title: "Registration Page"});
    // } else {
    //     Account.insertAccount(username, password);
    //     res.render("index");
    // }

    const hashedPassword = await passwordHandler.hash(password)

    await dbEngine.insertAccount(username, hashedPassword);

    res.render("index");


}


// FIXME: REMOVE ME ONCE DONE OR MOVE ME
controllerIndex.testDB = async (req, res, next) => {
    const baseSQL = `SELECT * FROM USERS;`;

    let rows = await db.any(baseSQL);
    if (!rows) {
        // throw error here. need error class to generate logs.
    }
    // add further logic here.
    // console.log(rows);
    res.json(rows);
}

/**
 * Login user based on the passport package
 *
 * Notes:
 *      *** The actual login of the user is handled by the middleware passport.authenticate('local')
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
controllerIndex.login = async (req, res, next) => {
    console.log("TEST")
    
    res.render("index", req.user);
    // res.json(req.user)
};

/**
 * Log out user based on the passport package
 *
 * Reference:
 *      Log Out
 *          Reference:
 *              http://www.passportjs.org/docs/logout/
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
controllerIndex.logout = async (req, res, next) => {
    // if (process.env.NODE_ENV === 'development') {
    //     debugPrinter.printMiddleware('Logout');
    //     debugPrinter.printFunction(
    //         `${req.route.stack[0].method}: ${req.route.path}`,
    //     );
    // }
    try {
        // Log out user
        await logOut(req, res, next);
    } catch (error) {
        next(error);
    }
};

module.exports = controllerIndex;
