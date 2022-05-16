const debugPrinter = require('../util/debug_printer');
const dbEngineGameUno = require('../controller/db_engine_game_uno');
const gameUno = require('../controller/game_uno_logic');
const utilCommon = require('../controller/util_common');
const intermediateSocketIOGameUno = require('../controller/intermediate_socket_io_game_uno');
const intermediateGameUno = require('../controller/intermediate_game_uno');
const constants = require('../config/constants');

const middlewareGameUnoGameGameID = {};

async function checkIfRouteExists(req, res, next) { // TODO RENAME AND CLEAN UP FIX
    if (isNaN(req.params.game_id)) {
        res.redirect('back');
    } else {
        next();
    }
}

middlewareGameUnoGameGameID.checkIfRouteExists = checkIfRouteExists;

/**
 * Validate if the req.body is correct using joi
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function validateRequestBody(req, res, next) {
    debugPrinter.printMiddleware(validateRequestBody.name);
    // TODO
    next();
}

middlewareGameUnoGameGameID.validateRequestBody = validateRequestBody;

/**
 * Check if the player can execute an action.
 * Basically, if it's the player's turn, then allow them to do the action
 * else send JSON saying they can't do that.
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function checkIfPlayerCanDoAction(req, res, next) {
    debugPrinter.printMiddleware(checkIfPlayerCanDoAction.name);

    if (req.game.player_id_turn === req.player.player_id) {
        next();
    } else {
        debugPrinter.printRed('ITS NOT YOUR TURN');
        res.json({
            status: constants.FAILURE,
            message: `It is not your turn player_id ${req.player.player_id}`,
        });
    }
}

middlewareGameUnoGameGameID.checkIfPlayerCanDoAction = checkIfPlayerCanDoAction;

/**
 *
 * Notes:
 *      If the user has a player that is in the game, they can use the API
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function checkIfAllowedToUseAPI(req, res, next) {
    // Get player of the user if they are already in the game

    // If the user is not a player in the game
    if (req.player) {
        next();
    } else {
        res.json({
            status: constants.FAILURE,
            message: 'You are not a player in the game',
        });
    }
}

middlewareGameUnoGameGameID.checkIfAllowedToUseAPI = checkIfAllowedToUseAPI;

/**
 * IMPORTANT NOTES:
 *      THIS IS NOT IN AN API STYLE DUE TO THE REDIRECT AND utilCommon.reqSessionMessageHandler
 *      DO NOT USE THIS MIDDLEWARE IF USING API STYLE
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function checkIfInGameOrJoinGameIfPossibleNoPlayerInReqAndGuard(req, res, next) {
    debugPrinter.printMiddleware(checkIfInGameOrJoinGameIfPossibleNoPlayerInReqAndGuard.name);

    const resultPlayerObject = await gameUno.getPlayerDetailedByGameIDAndUserID(req.user.user_id, req.game.game_id);

    // If the user is not a player in the game
    if (resultPlayerObject.status_game_uno === constants.FAILURE) {
        const resultJoinGameObject = await intermediateGameUno.joinGameIfPossibleWrapped(req.user.user_id, req.game.game_id);

        // If the user failed to join the game as a player
        if (resultJoinGameObject.status_game_uno === constants.FAILURE) {
            utilCommon.attachMessageToSessionMessageIfPossible(
                req,
                resultJoinGameObject.status,
                resultJoinGameObject.message,
            );

            res.redirect('back');
        } else {
            next();
        }
    } else {
        next();
    }
}

middlewareGameUnoGameGameID.checkIfInGameOrJoinGameIfPossibleNoPlayerInReqAndGuard = checkIfInGameOrJoinGameIfPossibleNoPlayerInReqAndGuard;

async function checkIfPlayerIDIsHost(req, res, next) {
    debugPrinter.printMiddleware(checkIfPlayerIDIsHost.name);

    if (req.game.player_id_host === req.player.player_id) {
        next();
    } else {
        res.json({
            status: constants.FAILURE,
            message: 'You are not the host',
        });
    }
}

middlewareGameUnoGameGameID.checkIfPlayerIDIsHost = checkIfPlayerIDIsHost;

module.exports = middlewareGameUnoGameGameID;
