const express = require('express');
const middlewareAuthenticationPassport = require('../../middleware/middleware_authentication_passport');
const middlewareValidationGameLogic = require('../../middleware/middleware_validation_game_logic');

const routerGamesAPI = express.Router();

routerGamesAPI.use(middlewareValidationGameLogic.checkIfPlayerIsPlayerInGame);
routerGamesAPI.use(middlewareValidationGameLogic.validateRequestBody);
routerGamesAPI.use(middlewareValidationGameLogic.checkIfPlayerCanDoAction);

routerGamesAPI.post('playCard');


module.exports = routerGamesAPI;
