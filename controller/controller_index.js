const db = require('../db/index');
const dbEngine = require('./db_engine');
const passwordHandler = require('./handler_password');

const debugPrinter = require('../util/debug_printer');

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

    res.redirect('/');
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

    res.redirect('/');
}

controllerIndex.logOut = logOut;

async function renderIndex(req, res, next) {
    debugPrinter.printMiddleware(renderIndex.name);
    debugPrinter.printBackendBlue(req.user);

    res.render('index');
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
    res.render('registration', { title: 'registration', registration: true });
}

controllerIndex.renderRegistration = renderRegistration;

async function registration(req, res, next) {
    debugPrinter.printMiddleware(registration.name);

    debugPrinter.printDebug(req.body);

    const { username, display_name, password, confirm_password } = req.body;

    try {
        // Check if username already exists
        const existingAccount = await dbEngine.getAccountByUsername(username);

        if (existingAccount) {
            req.session.message = {
                status: 'failure',
                message: 'Username already exists',
            };

            res.redirect('back');
        }

        // Create new account
        else {
            const hashedPassword = await passwordHandler.hash(password);

            const account = await dbEngine.createAccount(
                username,
                display_name,
                hashedPassword,
            );

            debugPrinter.printBackendBlue(account);

            const accountStatistic = await dbEngine.creatAccountStatistic(
                account.account_id,
            );
            debugPrinter.printBackendMagenta(accountStatistic);
            debugPrinter.printBackendGreen(existingAccount);

            req.session.message = {
                status: 'success',
                message: `Account "${account.username}" was created`,
            };
            res.redirect('/');
        }

        debugPrinter.printBackendGreen('REDIRECTING');
    } catch (err) {
        debugPrinter.printError(`ERROR FROM ${registration.name}`);
        next(err);
    }
}

controllerIndex.registration = registration;

module.exports = controllerIndex;
