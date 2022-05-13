const path = require('path');
const db = require('../db/index');
const dbEngine = require('./db_engine');
const passwordHandler = require('./handler_password');

const debugPrinter = require('../util/debug_printer');
const gameUno = require('./game_uno_logic');
const intermediateGameUno = require('./intermediate_game_uno');
const utilCommon = require('./util_common');
const intermediateSocketIOGameUno = require('./intermediate_socket_io_game_uno');
const constants = require('../config/constants');

/* ############################################################################################################# */

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

    const jsonResponse = utilCommon.getJsonResponseAndAttachMessageToSessionMessageIfPossible(
        req,
        constants.SUCCESS,
        'Log in was successful',
    );

    res.json(jsonResponse);
    // res.redirect(jsonResponse.url);
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

    const jsonResponse = utilCommon.getJsonResponseAndAttachMessageToSessionMessageIfPossible(
        req,
        constants.SUCCESS,
        'Log out was successful',
    );

    res.json(jsonResponse);
    // res.redirect(jsonResponse.url);
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

    const result = await gameUno.getGamesWithTheirPlayersSimple();

    // debugPrinter.printBackendRed(JSON.stringify(result.games, null, 2));

    res.render('index', { game_list: result.games });
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

async function isRegistrationPossible(req, res, username, display_name) {
    let jsonResponse = null;

    // Check if username already exists
    const userByUsername = await dbEngine.getUserRowByUsername(username);

    if (userByUsername) {
        jsonResponse = utilCommon.getJsonResponseAndAttachMessageToSessionMessageIfPossible(
            req,
            constants.FAILURE,
            'Username already exists',
        );

        // res.json(jsonResponse);
        res.redirect(jsonResponse.url);
        return false;
    }

    // Check if display_name already exists
    const userByDisplayName = await dbEngine.getUserRowByDisplayName(display_name);

    if (userByDisplayName) {
        jsonResponse = utilCommon.getJsonResponseAndAttachMessageToSessionMessageIfPossible(
            req,
            constants.FAILURE,
            'Display name already exists',
        );

        // res.json(jsonResponse);
        res.redirect(jsonResponse.url);
        return false;
    }
    return true;
}

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

    if (await isRegistrationPossible(req, res, username, display_name)) {
        const hashedPassword = await passwordHandler.hash(password);

        // Create new User
        const user = await dbEngine.createUserAndUserStatisticRow(
            username,
            hashedPassword,
            display_name,
        );

        debugPrinter.printBackendGreen(user);

        const jsonResponse = utilCommon.getJsonResponseAndAttachMessageToSessionMessageIfPossible(
            req,
            constants.SUCCESS,
            `User "${user.username}" was created`,
        );

        res.json(jsonResponse);
        // res.redirect(jsonResponse.url);
    }
}

controllerIndex.POSTRegistration = POSTRegistration;

async function POSTCreateGame(req, res, next) { // TODO CLEAN UP THIS
    debugPrinter.printMiddleware(POSTCreateGame.name);

    const result = await intermediateGameUno.createGameWrapped(req.user.user_id);

    // if (!result) {
    //     utilCommon.reqSessionMessageHandler(req, constants.FAILURE, 'Game failed to be created');
    //     res.redirect('back');
    // } else {
    //     utilCommon.reqSessionMessageHandler(req, constants.SUCCESS, `Game id ${result.game_id} created`);
    //     res.redirect(result.game_url);
    // }

    debugPrinter.printBackendWhite(result);

    if (!result) {
        const jsonResponse = utilCommon.getJsonResponseAndAttachMessageToSessionMessageIfPossible(
            req,
            constants.SUCCESS,
            'Game failed to be created',
        );
        res.json(jsonResponse);
    } else {
        const jsonResponse = utilCommon.getJsonResponseAndAttachMessageToSessionMessageIfPossible(
            req,
            constants.SUCCESS,
            `Game id ${result.game.game_id} created`,
            result.game_url,
        );
        res.json(jsonResponse);
    }
}

controllerIndex.POSTCreateGame = POSTCreateGame;

module.exports = controllerIndex;
