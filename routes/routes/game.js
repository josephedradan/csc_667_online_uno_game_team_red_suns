const express = require('express');

const routerGame = express.Router();
const routerGamesID = require('./game_id');

const middlewarePassport = require('../../middleware/middleware_passport');

const controllerGame = require('../../controller/controller_game');
const middlewareGameUno = require('../../middleware/middleware_game_uno');

// Need to be logged in to access any route past this point
routerGame.use(middlewarePassport.checkAuthenticated);

routerGame.get(
    '/',
    controllerGame.GETGame,
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

routerGame.use('/:game_id', routerGamesID);

module.exports = routerGame;
