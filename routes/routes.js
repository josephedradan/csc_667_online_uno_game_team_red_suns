const express = require('express');

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const testRouter = require("./routes/test");
const gameRouter = require("./routes/games");

const router = express.Router();

router.use("/", indexRouter);
router.use("/users", usersRouter);
router.use("/games", gameRouter);
router.use("/test", testRouter);

module.exports = router;
