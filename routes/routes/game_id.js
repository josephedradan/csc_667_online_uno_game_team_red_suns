/*

Notes:
    All routes here should return json
 */
const express = require('express');
const middlewareGameUnoGameGameID = require('../../middleware/middleware_game_uno_game_game_id');
const controllerGameID = require('../../controller/controller_game_game_id');

const routerGameID = express.Router();

routerGameID.use(middlewareGameUnoGameGameID.checkIfAllowedToUseAPI);
routerGameID.use(middlewareGameUnoGameGameID.validateRequestBody); // FIXME: IS THIS A GENERAL REQ.BODY JOI VALIDATION, IS THIS NECESSARY?

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

routerGameID.use(middlewareGameUnoGameGameID.checkIfPlayerCanDoAction); // TODO WRITE

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
