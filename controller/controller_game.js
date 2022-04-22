const debugPrinter = require('../util/debug_printer');

const controllerGame = {};

function getGame(req, res, next) {
    debugPrinter.printMiddleware(getGame.name);

    req.session.message = {
        status: 'failure',
        message: 'This page does not exist mate',
    };

    res.redirect('/');
}

controllerGame.getGame = getGame;

function getGameByGameId(req, res, next) {
    debugPrinter.printMiddleware(getGameByGameId.name);

    console.log('MAIN TSET JOSEPH');

    res.render('lobby', {
        title: 'Lobby',
        inGame: false,
    });
}

controllerGame.getGameByGameId = getGameByGameId;

function getTestGame(req, res, next) {
    debugPrinter.printMiddleware(getTestGame.name);

    console.log('TEST GAME');
    res.render('lobby', { title: 'Game Lobby' });
}

controllerGame.getTestGame = getTestGame;

module.exports = controllerGame;
