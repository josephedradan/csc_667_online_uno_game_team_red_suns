const express = require('express');

const routerTest = express.Router();
const db = require('../../db');
const controllerTest = require('../../controller/controller_test');

routerTest.get('/', controllerTest.testDB);
routerTest.get('/:username', controllerTest.testDBSequelizeRaw);
routerTest.get('/testInitDeck', controllerTest.initializeDrawStack);

module.exports = routerTest;
