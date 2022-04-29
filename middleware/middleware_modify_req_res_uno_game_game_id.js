const debugPrinter = require('../util/debug_printer');
const dbEngineGameUno = require('../controller/db_engine_game_uno');
const utilCommon = require('../controller/util_common');

const middlewareModifyReqResGameUnoGameID = {};

/**
 * NOTES:
 *      THIS FUNCTION REQUIRES req.params
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function attachGameToRequestAndResponseLocalsIfPossible(req, res, next) {
    debugPrinter.printMiddleware(attachGameToRequestAndResponseLocalsIfPossible.name);

    const gameRow = await dbEngineGameUno.getGameRowByGameIDSimple(req.params.game_id);

    if (!gameRow) {
        utilCommon.reqSessionMessageHandler(req, 'failure', 'Game does not exist');

        res.redirect('/');
        return;
    }
    req.game = gameRow;

    res.locals.game = req.game;

    debugPrinter.printDebug(req.game);

    next();
}

middlewareModifyReqResGameUnoGameID.attachGameToRequestAndResponseLocals = attachGameToRequestAndResponseLocalsIfPossible;

/**
 * NOTES:
 *      THIS FUNCTION REQUIRES req.params
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function attachPlayerToRequestAndResponseLocalsIfPossible(req, res, next) {
    debugPrinter.printMiddleware(attachGameToRequestAndResponseLocalsIfPossible.name);

    const rowPlayer = await dbEngineGameUno.getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID(req.params.game_id, req.user.user_id);

    if (!rowPlayer) {
        utilCommon.reqSessionMessageHandler(req, 'failure', 'Player does not exist');

        res.redirect('/');
        return;
    }

    req.player = rowPlayer;

    res.locals.player = req.player;

    debugPrinter.printDebug(req.player);

    next();
}

middlewareModifyReqResGameUnoGameID.attachPlayerToRequestAndResponseLocals = attachPlayerToRequestAndResponseLocalsIfPossible;

module.exports = middlewareModifyReqResGameUnoGameID;
