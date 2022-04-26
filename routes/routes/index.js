const express = require('express');

const routerIndex = express.Router();
const db = require('../../db');

const controllerIndex = require('../../controller/controller_index');
const middlewarePassport = require('../../middleware/middleware_passport');
const middlewareJoi = require('../../middleware/middleware_joi');

/* GET home page. */

routerIndex.get('/', controllerIndex.GETIndex);

routerIndex.get('/registration', controllerIndex.GETRegistration);

routerIndex.post(
    '/login',
    middlewarePassport.checkUnauthenticated, // Check if not logged in
    middlewareJoi.validateUserLogin, // Validate req.body
    middlewarePassport.authenticate('local'), // Log in user via passport
    controllerIndex.POSTLogIn, // Do additional log in behavior
);

routerIndex.post(
    '/logout',
    middlewarePassport.checkAuthenticated, // Check if logged in
    middlewarePassport.logOut, // Log out user via passport
    controllerIndex.POSTLogOut, // Do additional log out behavior
);

routerIndex.post(
    '/registration',
    middlewareJoi.validateUserRegistration,
    controllerIndex.POSTRegistration,
);

routerIndex.post(
    '/createGame',
    middlewarePassport.checkAuthenticated, // Check if logged in
    controllerIndex.POSTCreateGame,
);

module.exports = routerIndex;
