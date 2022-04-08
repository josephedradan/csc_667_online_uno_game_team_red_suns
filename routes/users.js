const express = require("express");
const controllerUsers = require("../controller/controller_users");

const router = express.Router();

/* GET users listing. */
router.get("/", controllerUsers.sendUsers);
router.post("/registration", controllerUsers.registerUser); 

module.exports = router;
