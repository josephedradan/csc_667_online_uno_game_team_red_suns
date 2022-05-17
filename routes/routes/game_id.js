/*

Notes:
    All routes here should return json
 */
const express = require('express');
const middlewareGameUnoGameGameID = require('../../middleware/middleware_game_uno_game_game_id');
const controllerGameID = require('../../controller/controller_game_game_id');
const middlewareUnoGameSettings = require('../../middleware/middleware_game_uno_settings');

const routerGameID = express.Router();

routerGameID.use(middlewareGameUnoGameGameID.checkIfAllowedToUseAPI);
// routerGameID.use(middlewareGameUnoGameGameID.validateRequestBody); // FIXME: IS THIS A GENERAL REQ.BODY JOI VALIDATION, IS THIS NECESSARY?

routerGameID.post(
    '/sendMessage',
    controllerGameID.POSTSendMessage, // TODO WRITE AND DO JOI VALIDATION
);

routerGameID.get(
    '/getMessages',
    controllerGameID.GETGetMessages, // TODO CLEAN
);

routerGameID.get(
    '/getGameState',
    controllerGameID.GETGetGameState,
);

routerGameID.get(
    '/getPlayers',
    controllerGameID.GETGetGameAndTheirPlayers,
);

routerGameID.get(
    '/getGame',
    controllerGameID.GETGetGameAndTheirPlayers,
);

routerGameID.get(
    '/getPlayer',
    controllerGameID.GETGetPlayer,
);

/*
Notes:
    Leaving the game automatically happens if the game.is_active === false and works via socket disconnect.
    If game.is_active === true then you must explicitly call the below function to leave entirely.
    If the player that leaves is the host, then the game dies.
 */
routerGameID.post(
    '/leaveGame',
    controllerGameID.POSTLeaveGame,
);

routerGameID.post(
    '/startGame',
    middlewareGameUnoGameGameID.checkIfPlayerIDIsHost,
    middlewareUnoGameSettings.checkIfPlayersMinIsReached,
    controllerGameID.POSTStartGame,
);

routerGameID.post(
    '/transferHost',
    middlewareGameUnoGameGameID.checkIfPlayerIDIsHost,
    controllerGameID.POSTTransferHost,
);

routerGameID.get(
    '/getHand',
    controllerGameID.GETGetHand,
);

routerGameID.post(
    '/uno',
    controllerGameID.POSTUno,
);

routerGameID.use(middlewareGameUnoGameGameID.checkIfPlayerCanDoAction);

routerGameID.post(
    '/playCard',
    controllerGameID.POSTPlayCard, // TODO WRITE AND DO JOI VALIDATION
);

routerGameID.get(
    '/drawCard',
    controllerGameID.GETDrawCard,
);

routerGameID.post(
    '/challenge',
    controllerGameID.POSTChallenge,
);

module.exports = routerGameID;
