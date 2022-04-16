const db = require("../db/index");
const dbEngine = require("./db_engine");
const passwordHandler = require("./handler_password");

const debugPrinter = require('../util/debug_printer');

/* ############################################################################################################## */

const controllerIndex = {}

/**
 * Log in user. Actual login is handled by passport middleware
 *
 * Notes:
 *      Any additional stuff related to logging in should be placed here
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function logIn(req, res, next) {
    debugPrinter.printMiddleware(logIn.name);

    res.redirect("/");
}

controllerIndex.logIn = logIn

/**
 * Log out user. Actual log out is handled by passport middleware
 *
 * Notes:
 *      Any additional stuff related to logging out should be placed here
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function logOut(req, res, next) {
    debugPrinter.printMiddleware(logOut.name);

    res.redirect("/")
}

controllerIndex.logOut = logOut

async function renderIndex(req, res, next) {
    debugPrinter.printMiddleware(renderIndex.name);

    debugPrinter.printBackendBlue(req.user)

    res.render("index", req.user)
}

controllerIndex.renderIndex = renderIndex

async function renderRegistration(req, res, next) {
    debugPrinter.printMiddleware(renderRegistration.name);

    debugPrinter.printDebug(req.user);

    const {
        username,
        password,
        confirm_password
    } = req.body;

    try {
        const hashedPassword = await passwordHandler.hash(password);
        await dbEngine.insertAccount(username, hashedPassword);


        // TODO: CHECK IF THE USERNAME ALREADY EXISTS AND SHIT

        debugPrinter.printBackendGreen("REDIRECTING")

    } catch (err) {
        console.log("Failure to insert user onto the database.");
        console.log(err);
    }
    res.redirect("/");

}

controllerIndex.renderRegistration = renderRegistration

// FIXME: REMOVE ME ONCE DONE OR MOVE ME
async function testDB(req, res, next) {
    const baseSQL = `SELECT * FROM USERS;`;

    let rows = await db.any(baseSQL);
    if (!rows) {
        // throw error here. need error class to generate logs.
    }
    // add further logic here.
    // console.log(rows);
    res.json(rows);
}

controllerIndex.testDB = testDB


module.exports = controllerIndex;
