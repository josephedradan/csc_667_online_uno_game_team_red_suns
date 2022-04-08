const express = require("express");
const controllerUsers = require("../controller/controller_users");

const router = express.Router();

/* GET users listing. */
router.get("/", controllerUsers.sendUsers);

module.exports = router;
