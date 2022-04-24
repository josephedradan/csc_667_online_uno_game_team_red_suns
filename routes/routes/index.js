const express = require('express');

const routerIndex = express.Router();
const db = require('../../db');

const controllerIndex = require('../../controller/controller_index');
const middlewareAuthenticationPassport = require('../../middleware/middleware_authentication_passport');
const middlewareValidationJoi = require('../../middleware/middleware_validation_joi');

/* GET home page. */

routerIndex.get('/', controllerIndex.getIndex);

routerIndex.get('/registration', controllerIndex.getRegistration);

routerIndex.post(
    '/login',
    middlewareAuthenticationPassport.checkUnauthenticated, // Check if not logged in
    middlewareValidationJoi.validateUserLogin, // Validate req.body
    middlewareAuthenticationPassport.authenticate('local'), // Log in user via passport
    controllerIndex.getLogIn, // Do additional log in behavior
);

routerIndex.post(
    '/logout',
    middlewareAuthenticationPassport.checkAuthenticated, // Check if logged in
    middlewareAuthenticationPassport.logOut, // Log out user via passport
    controllerIndex.getLogOut, // Do additional log out behavior
);

routerIndex.post(
    '/registration',
    middlewareValidationJoi.validateUserRegistration,
    controllerIndex.postRegistration,
);

routerIndex.post(
    '/createGame',
    middlewareAuthenticationPassport.checkAuthenticated, // Check if logged in
    controllerIndex.postCreateGame,
);

module.exports = routerIndex;
