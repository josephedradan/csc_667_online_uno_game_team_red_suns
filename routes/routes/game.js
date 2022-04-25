const express = require('express');

const routerGame = express.Router();
const routerGamesAPI = require('./game_api');

const middlewarePassport = require('../../middleware/middleware_passport');

const controllerGame = require('../../controller/controller_game');
const middlewareGameUno = require('../../middleware/middleware_game_uno');

// Need to be logged in to access any route past this point
routerGame.use(middlewarePassport.checkAuthenticated);

// TODO REDESIGN BASED ON ID SO /:game_id/COMMAND
// routerGame.use('/api', routerGamesAPI);

routerGame.get(
    '/',
    controllerGame.getGame,
);

// routerGame.get(
//     '/getTestGame',
//     controllerGame.getTestGame,
// );

routerGame.use(
    '/:game_id',
    middlewareGameUno.attachGameToRequestAndResponseLocals,
    middlewareGameUno.attachPlayerToRequestAndResponseLocals,
);

routerGame.get(
    '/:game_id',
    controllerGame.getGameByGameId,
);

module.exports = routerGame;
