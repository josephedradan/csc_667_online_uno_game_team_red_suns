const express = require("express");
const routerIndex = express.Router();
const db = require("../../db");

const controllerIndex = require("../../controller/controller_index");
const middlewareAuthentication = require("../../middleware/middleware_authentication");
const middlewareValidation = require("../../middleware/middleware_validation");

/* GET home page. */


routerIndex.get("/", controllerIndex.renderIndex);

routerIndex.post(
    "/login",
    middlewareAuthentication.checkUnauthenticated, // Check if not logged in
    middlewareValidation.validateAccountLogin, // FIXME: THIS IS RESTFUL
    middlewareAuthentication.authenticate('local'), // FIXME: THE LOGIN IS RESTFUL
    controllerIndex.login, // FIXME: FILL OUT AND IS NOT REACHED BECAUSE OF THE PREVIOUS MIDDLEWARE
);

routerIndex.post(
    '/logout',
    middlewareAuthentication.checkAuthenticated, // Check if logged in // FIXME: THIS IS RESTFUL
    controllerIndex.logout, // FIXME: THIS IS RESTFUL
);

routerIndex.post(
    "/registration",
    middlewareValidation.validateAccountRegistration, // FIXME: THIS IS RESTFUL
    controllerIndex.renderRegistration
);

// FIXME: THIS IS TEMPORARY, REMOVE THIS WHEN DONE
routerIndex.get("/dbtest", controllerIndex.testDB); // FIXME, THIS WILL CRASH UNLESS THE DB EXISTS


module.exports = routerIndex;
