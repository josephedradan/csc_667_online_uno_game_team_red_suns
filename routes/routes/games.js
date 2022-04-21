const express = require('express');

const routerGames = express.Router();
const routerGamesAPI = require('./games_api');

const middlewareAuthenticationPassport = require('../../middleware/middleware_authentication_passport');

const controllerGames = require('../../controller/controller_games');

// Need to be logged in to access any route past this point
routerGames.use(middlewareAuthenticationPassport.checkAuthenticated);

routerGames.use('/api', routerGamesAPI);

routerGames.get(
    '/',
    controllerGames.renderPreGameLobby,
);

routerGames.get(
    '/renderTestGame',
    controllerGames.renderTestGame,
);

// routerGames.get(
//     '/makeDeck',
//     controllerGames.renderTestMakeDeck,
// );

module.exports = routerGames;
