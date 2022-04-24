const debugPrinter = require('../util/debug_printer');
const utilCommon = require('../util/utilCommon');

const controllerGame = {};

/**
 * This should be the /game path that does not exist
 *
 * @param req
 * @param res
 * @param next
 */
function getGame(req, res, next) {
    debugPrinter.printMiddleware(getGame.name);

    utilCommon.reqSessionMessageHandler(
        req,
        'failure',
        'This page does not exist.',
    );

    res.redirect('/');
}

controllerGame.getGame = getGame;

/**
 * Get Request to get a game given the game's game_id
 *
 * @param req
 * @param res
 * @param next
 */
function getGameByGameId(req, res, next) {
    debugPrinter.printMiddleware(getGameByGameId.name);

    res.render('lobby');
}

controllerGame.getGameByGameId = getGameByGameId;

// function getTestGame(req, res, next) {
//     debugPrinter.printMiddleware(getTestGame.name);
//
//     res.render('lobby', { title: 'Game Lobby' });
// }
//
// controllerGame.getTestGame = getTestGame;

module.exports = controllerGame;
