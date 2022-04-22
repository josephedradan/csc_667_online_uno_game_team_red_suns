const express = require('express');

const routerGame = express.Router();
const routerGamesAPI = require('./game_api');

const middlewareAuthenticationPassport = require('../../middleware/middleware_authentication_passport');

const controllerGame = require('../../controller/controller_game');
const middlewareGameUno = require('../../middleware/middleware_game_uno');

// Need to be logged in to access any route past this point
routerGame.use(middlewareAuthenticationPassport.checkAuthenticated);

routerGame.use('/api', routerGamesAPI);

routerGame.get(
    '/',
    controllerGame.getGame,
);

routerGame.get(
    '/getTestGame',
    controllerGame.getTestGame,
);

routerGame.get(
    '/:game_id',
    middlewareGameUno.attachGameToResLocals,
);

routerGame.get(
    '/:game_id',
    controllerGame.getGameByGameId,
);

module.exports = routerGame;
