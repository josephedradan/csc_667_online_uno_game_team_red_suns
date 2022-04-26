const debugPrinter = require('../util/debug_printer');
const utilCommon = require('../util/util_common');
const logicGameUno = require('./logic_game_uno');
const dbEngineGameUno = require('./db_engine_game_uno');

const controllerGame = {};

/**
 * This should be the /game path that does not exist
 *
 * @param req
 * @param res
 * @param next
 */
async function GETGame(req, res, next) {
    debugPrinter.printMiddleware(GETGame.name);

    utilCommon.reqSessionMessageHandler(
        req,
        'failure',
        'This page does not exist.',
    );

    res.redirect('/');
}

controllerGame.GETGame = GETGame;

/**
 * Get Request to get a game given the game's game_id
 *
 * @param req
 * @param res
 * @param next
 */
async function GETGameByGameId(req, res, next) {
    debugPrinter.printMiddleware(GETGameByGameId.name);
    debugPrinter.printError(req.game.game_id);
    debugPrinter.printError(req.user.user_id);

    // JOIN GAME IF NOT ALREADY // TODO FIX THIS BY LIMITING AMOUNT OF PLAYERS
    const result = await dbEngineGameUno.getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID(req.game.game_id, req.user.user_id);

    if (!result) {
        const x = await logicGameUno.joinGame(req.game.game_id, req.user.user_id);
        debugPrinter.printDebug(`PLAYER HAS JOINED GAME: ${req.game.game_id}`);
        debugPrinter.printDebug(x);
    }

    /*
    This is the current/most recent game_id that the user is on. DO NOT RELY ON THIS, IT WILL CHANGE OVER TIME.

    Notes:
        This is used for socket.io socket instance to identify what game the user is CURRENTLY on.
        This value is used immediately when the user connects to their game to make them join that socket.io channel room.
        If the user on the website emits the 'join-room' event after they have connected to a different game, then
        they would also receive the emits from the server from that new game because game_id_temp would have changed.

     */
    // req.session.game_id_temp = req.game.game_id;

    res.render('lobby');
}

controllerGame.GETGameByGameId = GETGameByGameId;

// /**
//  * Super cheap wait of getting the id of the game via post request
//  *
//  * @param req
//  * @param res
//  * @param next
//  */
// function postGameByGameId(req, res, next) {
//     debugPrinter.printMiddleware(GETGameByGameId.name);
//     res.json(req.params);
// }
//
// controllerGame.postGameByGameId = postGameByGameId;

// function getTestGame(req, res, next) {
//     debugPrinter.printMiddleware(getTestGame.name);
//
//     res.render('lobby', { title: 'Game Lobby' });
// }
//
// controllerGame.getTestGame = getTestGame;

module.exports = controllerGame;
