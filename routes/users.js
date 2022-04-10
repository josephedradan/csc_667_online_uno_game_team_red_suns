const express = require("express");
const controllerUsers = require("../controller/controller_users");
const router = express.Router();
const middlewareAuthentication = require("../middleware/middleware_authentication");

/* GET users listing. */
router.get("/", controllerUsers.sendUsers);
router.post("/registration", controllerUsers.registerUser); 
router.post("/login", middlewareAuthentication.authenticate('local')); // FIXME: THE LOGIN IS RESTFUL

module.exports = router;
