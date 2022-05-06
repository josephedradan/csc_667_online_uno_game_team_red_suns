const debugPrinter = require('../util/debug_printer');
const dbEngineGameUno = require('../controller/db_engine_game_uno');
const gameUno = require('../controller/game_uno');
const utilCommon = require('../controller/util_common');
const intermediateSocketIOGameUno = require('../controller/intermediate_socket_io_game_uno');
const intermediateGameUno = require('../controller/intermediate_game_uno');
const constants = require('../server/constants');

const middlewareGameUnoGamdID = {};

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

middlewareGameUnoGamdID.validateRequestBody = validateRequestBody;

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
    // TODO

    next();
}

middlewareGameUnoGamdID.checkIfPlayerCanDoAction = checkIfPlayerCanDoAction;

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
    const { player } = req;
    // TODO

    // If the user is not a player in the game
    if (!player) {
        res.json({
            status: constants.FAILURE,
            message: 'You are not a player in the game',
        });
        return;
    }

    // Go to the next middleware
    next();
}

middlewareGameUnoGamdID.checkIfAllowedToUseAPI = checkIfAllowedToUseAPI;

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
async function joinGameIfPossibleNoPlayerInReq(req, res, next) {
    debugPrinter.printMiddleware(joinGameIfPossibleNoPlayerInReq.name);

    const resultPlayerDetailed = await gameUno.getPlayerDetailedByGameIDAndUserID(req.game.game_id, req.user.user_id);

    // If the user is not a player in the game
    if (resultPlayerDetailed.status === constants.FAILURE) {
        const resultJoinGame = await intermediateGameUno.joinGameIfPossibleWrapped(req.game.game_id, req.user.user_id);

        // If the user failed to join the game as a player
        if (resultJoinGame.status === constants.FAILURE) {
            utilCommon.reqSessionMessageHandler(
                req,
                resultJoinGame.status,
                resultJoinGame.message,
            );

            res.redirect('back');
        } else {
            next();
        }
    } else {
        next();
    }
}

middlewareGameUnoGamdID.joinGameIfPossibleNoPlayerInReq = joinGameIfPossibleNoPlayerInReq;

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

middlewareGameUnoGamdID.checkIfPlayerIDIsHost = checkIfPlayerIDIsHost;

module.exports = middlewareGameUnoGamdID;
