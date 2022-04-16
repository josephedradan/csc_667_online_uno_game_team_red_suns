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
async function login(req, res, next) {
    debugPrinter.printMiddleware(login.name);

    res.redirect("/");
}

controllerIndex.login = login

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
async function logout(req, res, next) {
    debugPrinter.printMiddleware(logout.name);

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
}
;
controllerIndex.logout = logout

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
        res.redirect("/");

    } catch (err) {
        console.log("Failure to insert user onto the database.");
        console.log(err);
    }

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
