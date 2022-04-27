const express = require('express');
const middlewarePassport = require('../../middleware/middleware_passport');
const middlewareGameUno = require('../../middleware/middleware_game_uno');
const controllerGameID = require('../../controller/controller_game_game_id');
const controllerGame = require('../../controller/controller_game');

const routerGameID = express.Router();



routerGameID.get(
    '/',
    controllerGame.GETGameByGameId,
);



routerGameID.use(middlewareGameUno.checkIfPlayerIsPlayerInGame);
routerGameID.use(middlewareGameUno.validateRequestBody); // FIXME: IS THIS A GENERAL REQ.BODY JOI VALIDATION, IS THIS NECESSARY?

routerGameID.post(
    '/sendMessage',
    controllerGameID.POSTSendMessage, // TODO JOI VALIDATION
);

routerGameID.get(
    '/getAllMessages',
    controllerGameID.GETAllMessages,
);
routerGameID.get(
    '/currentGame',
    controllerGameID.GETCurrentGame,
);

routerGameID.use(middlewareGameUno.checkIfPlayerCanDoAction);

routerGameID.post(
    '/playCard',
    controllerGameID.POSTPlayCard, // TODO VALIDATION
);

routerGameID.post(
    '/drawCard',
    controllerGameID.GETDrawCard,
);

routerGameID.post(
    '/startGame',
    controllerGameID.POSTStartGame,
);

module.exports = routerGameID;
