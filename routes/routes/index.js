const express = require("express");
const routerIndex = express.Router();
const db = require("../../db");

const controllerIndex = require("../../controller/controller_index");
const middlewareAuthenticationPassport = require("../../middleware/middleware_authentication_passport");
const middlewareValidationJoi = require("../../middleware/middleware_validation_joi");

/* GET home page. */

routerIndex.get("/", controllerIndex.renderIndex);

routerIndex.get(
    "/registration",
    controllerIndex.renderRegistration
);


routerIndex.post(
    "/logIn",
    middlewareAuthenticationPassport.checkUnauthenticated, // Check if not logged in
    middlewareValidationJoi.validateAccountLogin, // Validate req.body
    middlewareAuthenticationPassport.authenticate('local'), // Log in user via passport
    controllerIndex.logIn, // Do additional log in behavior
);

routerIndex.post(
    '/logOut',
    middlewareAuthenticationPassport.checkAuthenticated, // Check if logged in
    middlewareAuthenticationPassport.logOut, // Log out user via passport
    controllerIndex.logOut, // Do additional log out behavior
);

routerIndex.post(
    "/registration",
    middlewareValidationJoi.validateAccountRegistration,
    controllerIndex.registration
);

// FIXME: THIS IS TEMPORARY, REMOVE THIS WHEN DONE
routerIndex.get("/dbtest", controllerIndex.testDB); // FIXME, THIS WILL CRASH UNLESS THE DB EXISTS


module.exports = routerIndex;
