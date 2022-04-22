const express = require('express');
const middlewareAuthenticationPassport = require('../../middleware/middleware_authentication_passport');
const middlewareGameUno = require('../../middleware/middleware_game_uno');
const controllerGameAPI = require('../../controller/controller_game_api');

const routerGameAPI = express.Router();

routerGameAPI.use(middlewareGameUno.checkIfPlayerIsPlayerInGame);
routerGameAPI.use(middlewareGameUno.validateRequestBody);
routerGameAPI.use(middlewareGameUno.checkIfPlayerCanDoAction);

routerGameAPI.post(
    '/playCard',
    controllerGameAPI.postPlayCard,
);

routerGameAPI.get(
    '/drawCArd',
    controllerGameAPI.getDrawCard,
);

module.exports = routerGameAPI;
