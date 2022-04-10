const express = require("express");
const routerGames = express.Router();

const controllerGames = require("../../controller/controller_games")

routerGames.get("/", controllerGames.renderPreGameLobby);

routerGames.get("/renderTestGame", controllerGames.renderTestGame);

module.exports = routerGames;
