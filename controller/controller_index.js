const path = require('path');
const db = require('../db/index');
const dbEngine = require('./db_engine');
const passwordHandler = require('./handler_password');

const debugPrinter = require('../util/debug_printer');
const logicGameUno = require('./logic_game_uno');
const handlerGameUno = require('./handler_game_uno');
const utilCommon = require('../util/util_common');

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
async function postLogIn(req, res, next) {
    debugPrinter.printMiddleware(postLogIn.name);

    res.redirect('/');
}

controllerIndex.postLogIn = postLogIn;

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
async function postLogOut(req, res, next) {
    debugPrinter.printMiddleware(postLogOut.name);

    res.redirect('/');
}

controllerIndex.postLogOut = postLogOut;

/**
 * get Index page
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function getIndex(req, res, next) {
    debugPrinter.printMiddleware(getIndex.name);
    debugPrinter.printBlue(req.user);

    const gameList = await dbEngine.getGameRows();
    console.log(gameList);

    res.render('index', { gameList });
}

controllerIndex.getIndex = getIndex;

/**
 * Get registration page
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function getRegistration(req, res, next) {
    res.render('registration', {
        title: 'registration',
        postRegistration: true,
    });
}

controllerIndex.getRegistration = getRegistration;

/**
 * Handle post requset to registration
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function postRegistration(req, res, next) {
    debugPrinter.printMiddleware(postRegistration.name);

    debugPrinter.printDebug(req.body);

    const {
        username,
        display_name,
        password,
        confirm_password,
    } = req.body;

    try {
        // Check if username already exists
        const userByUsername = await dbEngine.getUserRowByUsername(username);

        if (userByUsername) {
            utilCommon.reqSessionMessageHandler(
                req,
                'failure',
                'Username already exists',
            );

            res.redirect('back');
            return;
        }

        // Check if display_name already exists
        const userByDisplayName = await dbEngine.getUserRowByDisplayName(display_name);

        if (userByDisplayName) {
            utilCommon.reqSessionMessageHandler(
                req,
                'failure',
                'Display name already exists',
            );

            res.redirect('back');
            return;
        }

        // Create new User

        const hashedPassword = await passwordHandler.hash(password);

        const user = await dbEngine.createUserAndUserStatisticRow(
            username,
            hashedPassword,
            display_name,
        );

        debugPrinter.printBackendGreen(user);

        utilCommon.reqSessionMessageHandler(req, 'success', `User "${user.username}" was created`);

        res.redirect('/');

        debugPrinter.printBackendGreen('REDIRECTING');
    } catch (err) {
        debugPrinter.printError(`ERROR FROM ${postRegistration.name}`);
        next(err);
    }
}

controllerIndex.postRegistration = postRegistration;

// TODO MOVE THIS TO controller_game_api MAYBE
async function postCreateGame(req, res, next) {
    debugPrinter.printMiddleware(postCreateGame.name);

    const result = await handlerGameUno.createGameWrapped(req.user.user_id);

    utilCommon.reqSessionMessageHandler(req, 'success', `Game id ${result.game_id} created`);

    res.redirect(result.game_url);
}

controllerIndex.postCreateGame = postCreateGame;

module.exports = controllerIndex;
