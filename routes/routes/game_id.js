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

routerGameID.use(middlewareGameUno.checkIfPlayerIsPlayerInGame); // TODO CHANGE HANGE AND CHANGE JOB
routerGameID.use(middlewareGameUno.validateRequestBody); // FIXME: IS THIS A GENERAL REQ.BODY JOI VALIDATION, IS THIS NECESSARY?

routerGameID.post(
    '/sendMessage',
    controllerGameID.POSTSendMessage, // TODO WRITE AND DO JOI VALIDATION
);

routerGameID.get(
    '/getAllMessages',
    controllerGameID.GETAllMessages,
);
routerGameID.get(
    '/currentGame',
    controllerGameID.GETCurrentGame,
);

routerGameID.use(middlewareGameUno.checkIfPlayerCanDoAction); // TODO WRITE

routerGameID.post(
    '/playCard',
    controllerGameID.POSTPlayCard, // TODO WRITE AND DO JOI VALIDATION
);

routerGameID.post(
    '/drawCard',
    controllerGameID.GETDrawCard, // TODO
);

routerGameID.post(
    '/startGame',
    controllerGameID.POSTStartGame, // TODO
);

routerGameID.get(
    '/getHand',
    controllerGameID.GETGetHand,
);

module.exports = routerGameID;
