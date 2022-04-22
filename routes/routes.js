const express = require('express');

const routerIndex = require('./routes/index');
const routerUser = require('./routes/users');
const routerTest = require('./routes/test');
const routerGame = require('./routes/game');

const router = express.Router();

router.use('/', routerIndex);
router.use('/users', routerUser);
router.use('/game', routerGame);
router.use('/test', routerTest);

module.exports = router;
