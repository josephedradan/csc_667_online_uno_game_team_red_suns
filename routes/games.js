const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
    res.render("pregame_lobby", { title: "Pre-game Lobby" });
});

module.exports = router;
