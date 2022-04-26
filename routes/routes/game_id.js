const express = require('express');
const middlewarePassport = require('../../middleware/middleware_passport');
const middlewareGameUno = require('../../middleware/middleware_game_uno');
const controllerGameAPI = require('../../controller/controller_game_game_id');
const controllerGame = require('../../controller/controller_game');

const routerGameID = express.Router();


routerGameID.use(middlewareGameUno.checkIfPlayerIsPlayerInGame);
routerGameID.use(middlewareGameUno.validateRequestBody);
routerGameID.use(middlewareGameUno.checkIfPlayerCanDoAction);

routerGameID.get(
    '/getCurrentGame',
    controllerGameAPI.getCurrentGame,
);

routerGameID.post(
    '/playCard',
    controllerGameAPI.postPlayCard,
);

routerGameID.post(
    '/drawCard',
    controllerGameAPI.getDrawCard,
);

routerGameID.post(
    '/startGame',
    controllerGameAPI.getStartGame,
);

routerGameID.get(
    '/',
    controllerGame.getGameByGameId,
);

module.exports = routerGameID;
