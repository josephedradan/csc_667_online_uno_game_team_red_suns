/*

Notes:
    All routes here should return json
 */
const express = require('express');
const middlewareGameUnoGameGameID = require('../../middleware/middleware_game_uno_game_game_id');
const controllerGameID = require('../../controller/controller_game_game_id');

const routerGameID = express.Router();

routerGameID.use(middlewareGameUnoGameGameID.checkIfAllowedToUseAPI); // TODO
routerGameID.use(middlewareGameUnoGameGameID.validateRequestBody); // FIXME: IS THIS A GENERAL REQ.BODY JOI VALIDATION, IS THIS NECESSARY?

routerGameID.post(
    '/sendMessage',
    controllerGameID.POSTSendMessage, // TODO WRITE AND DO JOI VALIDATION
);

routerGameID.get(
    '/getAllMessages',
    controllerGameID.GETAllMessages, // TODO CLEAN
);

routerGameID.get(
    '/currentGame',
    controllerGameID.GETCurrentGame,
);

/*
Notes:
    Leaving the game automatically happens if the game.is_active === false
    If game.is_active === true then you must explicitly call the below function to leave entirely
 */
routerGameID.post(
    '/leaveGame',
    controllerGameID.POSTLeaveGame,
);

routerGameID.post(
    '/startGame',
    middlewareGameUnoGameGameID.checkIfPlayerIDIsHost,
    controllerGameID.POSTStartGame,
);

routerGameID.use(middlewareGameUnoGameGameID.checkIfPlayerCanDoAction); // TODO WRITE

routerGameID.post(
    '/playCard',
    controllerGameID.POSTPlayCard, // TODO WRITE AND DO JOI VALIDATION
);

routerGameID.get(
    '/drawCard',
    controllerGameID.GETDrawCard, // TODO
);

routerGameID.get(
    '/getHand',
    controllerGameID.GETGetHand,
);

module.exports = routerGameID;
