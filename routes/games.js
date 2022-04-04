const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
    res.render("pregame_lobby", { title: "Pre-game Lobby" });
});

router.get("/testGame", function (req, res, next) {
    res.render("game_lobby", { title: "Game Lobby" });
});

module.exports = router;
