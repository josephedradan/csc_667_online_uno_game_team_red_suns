const path = require('path');
const db = require('../db/index');
const dbEngine = require('./db_engine');
const passwordHandler = require('./handler_password');

const debugPrinter = require('../util/debug_printer');
const logicGameUno = require('./logic_game_uno');

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
async function getLogIn(req, res, next) {
    debugPrinter.printMiddleware(getLogIn.name);

    res.redirect('/');
}

controllerIndex.getLogIn = getLogIn;

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
async function getLogOut(req, res, next) {
    debugPrinter.printMiddleware(getLogOut.name);

    res.redirect('/');
}

controllerIndex.getLogOut = getLogOut;

async function getIndex(req, res, next) {
    debugPrinter.printMiddleware(getIndex.name);
    debugPrinter.printBackendBlue(req.user);

    res.render('index');
}

controllerIndex.getIndex = getIndex;

/**
 *
 * @returns {Promise<[{},{}]>}
 */
async function x() {
    return [{}, {}];
}

async function getRegistration(req, res, next) {
    res.render('registration', {
        title: 'registration',
        postRegistration: true,
    });
}

controllerIndex.getRegistration = getRegistration;

async function postRegistration(req, res, next) {
    debugPrinter.printMiddleware(postRegistration.name);

    debugPrinter.printDebug(req.body);

    const {
        username, display_name, password, confirm_password,
    } = req.body;

    try {
        // Check if username already exists
        const existingAccount = await dbEngine.getUserRowByUsername(username);

        if (existingAccount) {
            req.session.message = {
                status: 'failure',
                message: 'Username already exists',
            };

            res.redirect('back');
        } else {
            // Create new account

            const hashedPassword = await passwordHandler.hash(password);

            const user = await dbEngine.createUserRow(
                username,
                hashedPassword,
                display_name,
            );

            debugPrinter.printBackendBlue(user);

            const userStatistic = await dbEngine.createUserStatisticRow(
                user.user_id,
            );
            debugPrinter.printBackendMagenta(userStatistic);
            debugPrinter.printBackendGreen(existingAccount);

            req.session.message = {
                status: 'success',
                message: `Account "${user.username}" was created`,
            };
            res.redirect('/');
        }

        debugPrinter.printBackendGreen('REDIRECTING');
    } catch (err) {
        debugPrinter.printError(`ERROR FROM ${postRegistration.name}`);
        next(err);
    }
}

controllerIndex.postRegistration = postRegistration;

async function postCreateGame(req, res, next) {
    debugPrinter.printMiddleware(postCreateGame.name);

    // Create Player // ORDER NO MATTER
    // Crate Game // ORDER NO MATTER

    // Create Players row (for the host)

    // Generate literal cards for the game (CardState)
    // // LINK CardState TO CardInfo
    // // Link CardState TO Cards

    // Create Collection
    // // LINK TO CollectionInfo

    const result = await logicGameUno.createGame(req.user.user_id);

    debugPrinter.printBackendBlue(result);

    const url_game = `/game/${result.game.game_id}`;

    debugPrinter.printBackendGreen(url_game);

    res.redirect(url_game);
}

controllerIndex.postCreateGame = postCreateGame;

module.exports = controllerIndex;
