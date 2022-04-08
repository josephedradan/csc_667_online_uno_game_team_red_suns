const express = require("express");
const router = express.Router();

const controllerGames = require("../controller/controller_games")

router.get("/", controllerGames.renderPreGameLobby);

router.get("/renderTestGame", controllerGames.renderPreGameLobby);

module.exports = router;
