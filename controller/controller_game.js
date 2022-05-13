const debugPrinter = require('../util/debug_printer');
const utilCommon = require('./util_common');
const gameUno = require('./game_uno_logic');
const dbEngineGameUno = require('./db_engine_game_uno');
const intermediateSocketIOGameUno = require('./intermediate_socket_io_game_uno');
const constants = require('../config/constants');

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

    utilCommon.attachMessageToSessionMessageIfPossible(
        req,
        constants.FAILURE,
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
    debugPrinter.printDebug(req.game.game_id);
    debugPrinter.printDebug(req.user.user_id);

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
