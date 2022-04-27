const debugPrinter = require('../util/debug_printer');
const dbEngineGameUno = require('../controller/db_engine_game_uno');

const middlewareGameUnoLogic = {};

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

middlewareGameUnoLogic.validateRequestBody = validateRequestBody;

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

middlewareGameUnoLogic.checkIfPlayerCanDoAction = checkIfPlayerCanDoAction;

/**
 * Check if the player is a player in the game, this is to prevent non players from doing actions.
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function checkIfPlayerIsPlayerInGame(req, res, next) {





    next();
}

middlewareGameUnoLogic.checkIfPlayerIsPlayerInGame = checkIfPlayerIsPlayerInGame;

async function attachGameToRequestAndResponseLocals(req, res, next) {
    debugPrinter.printMiddleware(attachGameToRequestAndResponseLocals.name);

    req.game = await dbEngineGameUno.getGameRowByGameID(req.params.game_id);

    res.locals.game = req.game;

    debugPrinter.printDebug(req.game);

    next();
}

middlewareGameUnoLogic.attachGameToRequestAndResponseLocals = attachGameToRequestAndResponseLocals;

async function attachPlayerToRequestAndResponseLocals(req, res, next) {
    debugPrinter.printMiddleware(attachGameToRequestAndResponseLocals.name);

    req.player = await dbEngineGameUno.getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID(req.params.game_id, req.user.user_id);

    res.locals.player = req.player;

    debugPrinter.printDebug(req.player);

    next();
}

middlewareGameUnoLogic.attachPlayerToRequestAndResponseLocals = attachPlayerToRequestAndResponseLocals;

module.exports = middlewareGameUnoLogic;
