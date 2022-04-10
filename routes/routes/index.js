const express = require("express");
const routerIndex = express.Router();
const db = require("../../db");

const controllerIndex = require("../../controller/controller_index");
const middlewareAuthentication = require("../../middleware/middleware_authentication");
const middlewareValidation = require("../../middleware/middleware_validation");
const { func } = require("joi");

/* GET home page. */

routerIndex.get("/", controllerIndex.renderIndex);
routerIndex.get("/registration", (req, res, next) => {
    res.render("registration"); 
}); 


routerIndex.post(
    "/login",
    // middlewareAuthentication.checkUnauthenticated, // Check if not logged in
    middlewareValidation.validateAccountLogin,
    middlewareAuthentication.authenticate('local'),
    controllerIndex.login,
);

routerIndex.post(
    '/logout',
    middlewareAuthentication.checkAuthenticated, // Check if logged in
    controllerIndex.logout,
);

routerIndex.post(
    "/registration",
    middlewareValidation.validateAccountRegistration,
    controllerIndex.renderRegistration
);

// FIXME: THIS IS TEMPORARY, REMOVE THIS WHEN DONE
routerIndex.get("/dbtest", controllerIndex.testDB); // FIXME, THIS WILL CRASH UNLESS THE DB EXISTS


module.exports = routerIndex;
