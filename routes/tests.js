const express = require("express");
const router = express.Router();
const db = require("../db");
const controllerTests = require("../controller/controller_tests");

router.get("/", controllerTests.testDB)
router.get("/:username", controllerTests.testDBSequelizeRaw);

module.exports = router;
