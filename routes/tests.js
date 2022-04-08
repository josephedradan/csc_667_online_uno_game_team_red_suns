const express = require("express");
const router = express.Router();
const db = require("../db");
const controllerIndex = require("../controller/controller_tests");

router.get("/", controllerIndex.testDB);
module.exports = router;
