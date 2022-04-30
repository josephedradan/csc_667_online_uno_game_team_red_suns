const path = require('path');
const db = require('../db/index');
const dbEngine = require('./db_engine');
const passwordHandler = require('./handler_password');

const debugPrinter = require('../util/debug_printer');
const intermediateGameUno = require('./intermediate_game_uno');
const handlerGameUno = require('./handler_game_uno');
const utilCommon = require('./util_common');

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
async function POSTLogIn(req, res, next) {
    debugPrinter.printMiddleware(POSTLogIn.name);

    res.redirect('/');
}

controllerIndex.POSTLogIn = POSTLogIn;

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
async function POSTLogOut(req, res, next) {
    debugPrinter.printMiddleware(POSTLogOut.name);

    res.redirect('/');
}

controllerIndex.POSTLogOut = POSTLogOut;

/**
 * get Index page
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function GETIndex(req, res, next) {
    debugPrinter.printMiddleware(GETIndex.name);
    debugPrinter.printBlue(req.user);

    const gamesWithPlayersRows = await intermediateGameUno.getGamesAndTheirPlayers();

    debugPrinter.printBackendRed(JSON.stringify(gamesWithPlayersRows, null, 2));

    res.render('index', { game_list: gamesWithPlayersRows });
}

controllerIndex.GETIndex = GETIndex;

/**
 * Get registration page
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function GETRegistration(req, res, next) {
    res.render('registration', {
        title: 'registration',
        postRegistration: true,
    });
}

controllerIndex.GETRegistration = GETRegistration;

/**
 * Handle post requset to registration
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function POSTRegistration(req, res, next) {
    debugPrinter.printMiddleware(POSTRegistration.name);

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

        debugPrinter.printBackendGreen('REDIRECTING');
        res.redirect('/');
    } catch (err) {
        debugPrinter.printError(`ERROR FROM ${POSTRegistration.name}`);
        next(err);
    }
}

controllerIndex.POSTRegistration = POSTRegistration;

// TODO MOVE THIS TO controller_game_api MAYBE
async function POSTCreateGame(req, res, next) {
    debugPrinter.printMiddleware(POSTCreateGame.name);

    const result = await handlerGameUno.createGameWrapped(req.user.user_id);

    if (!result) {
        utilCommon.reqSessionMessageHandler(req, 'failure', 'Game failed to be created');
        res.redirect('back');
    } else {
        utilCommon.reqSessionMessageHandler(req, 'success', `Game id ${result.game_id} created`);

        res.redirect(result.game_url);
    }
}

controllerIndex.POSTCreateGame = POSTCreateGame;

module.exports = controllerIndex;
