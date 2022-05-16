const express = require('express');

const routerGame = express.Router();
const routerGamesID = require('./game_id');

const middlewarePassport = require('../../middleware/middleware_passport');

const controllerGame = require('../../controller/controller_game');
const middlewareGameUnoGameGameID = require('../../middleware/middleware_game_uno_game_game_id');
const middlewareModifyReqResGameUnoGameID = require('../../middleware/middleware_modify_req_res_uno_game_game_id');
const middlewareUnoGameSettings = require('../../middleware/middleware_game_uno_settings');

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

routerGame.use('/:game_id', middlewareGameUnoGameGameID.checkIfRouteExists);
routerGame.use('/:game_id', middlewareModifyReqResGameUnoGameID.attachGameToRequestAndResponseLocalAndGuard);
routerGame.use('/', middlewareUnoGameSettings.checkIfPlayerLimitIsReached);
routerGame.use('/', middlewareGameUnoGameGameID.checkIfInGameOrJoinGameIfPossibleNoPlayerInReqAndGuard);
routerGame.use('/:game_id', middlewareModifyReqResGameUnoGameID.attachPlayerToRequestAndResponseLocalsAndGuard);

routerGame.get('/:game_id', controllerGame.GETGameByGameId);

routerGame.use('/:game_id', routerGamesID);

module.exports = routerGame;
