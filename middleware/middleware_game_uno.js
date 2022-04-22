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

async function attachGameToResLocals(req, res, next) {
    debugPrinter.printMiddleware(attachGameToResLocals.name);

    res.locals.game = await dbEngineGameUno.getGameRowByGameID(req.params.game_id);

    debugPrinter.printDebug(res.locals.game);

    next();
}

middlewareGameUnoLogic.attachGameToResLocals = attachGameToResLocals;

module.exports = middlewareGameUnoLogic;
