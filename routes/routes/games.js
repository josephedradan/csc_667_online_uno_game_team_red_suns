const express = require('express');

const routerGames = express.Router();

const controllerGames = require('../../controller/controller_games');
const middlewareAuthenticationPassport = require('../../middleware/middleware_authentication_passport');

routerGames.get(
    '/',
    middlewareAuthenticationPassport.checkAuthenticated,
    controllerGames.renderPreGameLobby,
);

routerGames.get(
    '/renderTestGame',
    middlewareAuthenticationPassport.checkAuthenticated,
    controllerGames.renderTestGame,
);

routerGames.get(
    '/makeDeck',
    middlewareAuthenticationPassport.checkAuthenticated,
    controllerGames.renderTestMakeDeck,
);

module.exports = routerGames;
