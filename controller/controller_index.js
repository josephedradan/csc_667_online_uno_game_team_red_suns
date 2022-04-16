const db = require("../db/index");
const dbEngine = require("./db_engine");
const passwordHandler = require("./handler_password");

const debugPrinter = require("../util/debug_printer");

/* ############################################################################################################## */

const controllerIndex = {};

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

controllerIndex.logIn = logIn;

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

    res.redirect("/");
}

controllerIndex.logOut = logOut;

async function renderIndex(req, res, next) {
    debugPrinter.printMiddleware(renderIndex.name);

    debugPrinter.printBackendBlue(req.user);

    res.render("index", req.user);
}

controllerIndex.renderIndex = renderIndex;

/**
 *
 * @returns {Promise<[{},{}]>}
 */
async function x() {
    return [{}, {}];
}

async function renderRegistration(req, res, next) {
    res.render("registration", { title: "registration", registration: true });
}

controllerIndex.renderRegistration = renderRegistration;

async function registration(req, res, next) {
    debugPrinter.printMiddleware(registration.name);

    debugPrinter.printDebug(req.body);

    const { username, password, confirm_password } = req.body;

    try {
        // Check if username already exists
        let existingAccount = await dbEngine.getAccountByUsername(username);

        if (existingAccount) {
            res.json({
                status: "failed",
                message: "Username already exists",
                redirect: null,
            });
        }
        // Create new account
        else {
            const hashedPassword = await passwordHandler.hash(password);

            let account = await dbEngine.createAccount(
                username,
                hashedPassword
            );

            debugPrinter.printBackendBlue(account);

            let accountStatistic = await dbEngine.creatAccountStatistic(
                account.account_id
            );
            debugPrinter.printBackendMagenta(accountStatistic);

            debugPrinter.printBackendGreen(existingAccount);
            res.json({
                status: "success",
                message: `'Account ${account.username}'`,
                redirect: "/",
            });
        }

        debugPrinter.printBackendGreen("REDIRECTING");
    } catch (err) {
        console.log("Failure to insert user onto the database.");
        console.log(err);
        next(err);
    }
}

controllerIndex.registration = registration;

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

controllerIndex.testDB = testDB;

module.exports = controllerIndex;
