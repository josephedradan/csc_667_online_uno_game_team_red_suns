const express = require('express');

const indexRouter = require("./index");
const usersRouter = require("./users");
const testRouter = require("./tests");
const gameRouter = require("./games");

const router = express.Router();

router.use("/", indexRouter);
router.use("/users", usersRouter);
router.use("/tests", testRouter);
router.use("/games", gameRouter);

module.exports = router;
