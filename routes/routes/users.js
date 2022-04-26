const express = require('express');
const controllerUsers = require('../../controller/controller_user');

const routerUsers = express.Router();

/* GET users listing. */
// routerUsers.get("/", controllerUsers.getUsers); // FIXME: website.com/users/ ?????
// routerUsers.post("/POSTRegistration", controllerUsers.registerUser); // FIXME: Why website.com/users/POSTRegistration ?????

// FIXME: website.com/users/users/bob
// FIXME: website.com/users/users/joe

// TODO: THE ALTERNATIVE
// FIXME: website.com/users/user/bob
// FIXME: website.com/users/user/joe

module.exports = routerUsers;
