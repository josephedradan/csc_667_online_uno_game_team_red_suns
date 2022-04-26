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
    '/GETCurrentGame',
    controllerGameAPI.GETCurrentGame,
);

routerGameID.post(
    '/playCard',
    controllerGameAPI.POSTPlayCard,
);

routerGameID.post(
    '/drawCard',
    controllerGameAPI.GETDrawCard,
);

routerGameID.post(
    '/startGame',
    controllerGameAPI.POSTStartGame,
);

routerGameID.get(
    '/',
    controllerGame.GETGameByGameId,
);

module.exports = routerGameID;
