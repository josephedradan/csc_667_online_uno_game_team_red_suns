const debugPrinter = require('../util/debug_printer');
const dbEngineGameUno = require('../controller/db_engine_game_uno');
const intermediateGameUno = require('../controller/intermediate_game_uno');
const utilCommon = require('../controller/util_common');

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
    const player = await dbEngineGameUno.getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID(req.game.game_id, req.user.user_id);

    // If the user is not a player in the game
    if (!player) {
        res.json({
            status: 'failure',
            message: 'You are not a player in the game',
        });
        return;
    }

    // Go to the next middleware
    next();
}

middlewareGameUnoGamdID.checkIfAllowedToUseAPI = checkIfAllowedToUseAPI;

/**
 * NOTES:
 *      THIS FUNCTION REQUIRES req.params
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function attachGameToRequestAndResponseLocals(req, res, next) {
    debugPrinter.printMiddleware(attachGameToRequestAndResponseLocals.name);

    req.game = await dbEngineGameUno.getGameRowByGameID(req.params.game_id);

    res.locals.game = req.game;

    debugPrinter.printDebug(req.game);

    next();
}

middlewareGameUnoGamdID.attachGameToRequestAndResponseLocals = attachGameToRequestAndResponseLocals;

/**
 * NOTES:
 *      THIS FUNCTION REQUIRES req.params
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function attachPlayerToRequestAndResponseLocals(req, res, next) {
    debugPrinter.printMiddleware(attachGameToRequestAndResponseLocals.name);

    req.player = await dbEngineGameUno.getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID(req.params.game_id, req.user.user_id);

    res.locals.player = req.player;

    debugPrinter.printDebug(req.player);

    next();
}

middlewareGameUnoGamdID.attachPlayerToRequestAndResponseLocals = attachPlayerToRequestAndResponseLocals;

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
async function joinGameIfPossible(req, res, next) {
    debugPrinter.printMiddleware(joinGameIfPossible.name);

    // Is the game active (Is the game being played)
    if (await intermediateGameUno.checkIfGameIsActive(req.game.game_id)) {
        debugPrinter.printDebug('GAME IS ACTIVE');
        utilCommon.reqSessionMessageHandler(req, 'failure', 'Game is active');
        res.redirect('back');
        return;
    }

    // Get player of the user if they are already in the game
    const player = await dbEngineGameUno.getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID(req.game.game_id, req.user.user_id);

    debugPrinter.printDebug(player);

    // If the user is a player in the game
    if (player) {
        debugPrinter.printDebug('PLAYER IS ALREADY IN THE GAME');
        // utilCommon.reqSessionMessageHandler(req, 'success', 'Welcome back');
        next();
        return;
    }

    const result = await intermediateGameUno.joinGame(req.game.game_id, req.user.user_id);
    utilCommon.reqSessionMessageHandler(req, 'success', `You have successfully join game ${req.game.game_id}`);

    debugPrinter.printDebug(`PLAYER HAS JOINED GAME: ${req.game.game_id}`);
    debugPrinter.printDebug(result);

    next();
}

middlewareGameUnoGamdID.joinGameIfPossible = joinGameIfPossible;

module.exports = middlewareGameUnoGamdID;
