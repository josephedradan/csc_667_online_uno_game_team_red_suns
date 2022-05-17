const db = require('../db');
const dbEngine = require('./db_engine');

const controllerTest = {};

controllerTest.initializeDrawStack = async (req, res, next) => {
    const newDeck = [];
    const coloredNumCards = await dbEngine.getCardTableOnType('NUMBER');
    const blackWildCards = await dbEngine.getCardTableOnType('SPECIAL');
    // console.log(coloredNumCards);
    // console.log(blackWildCards);

    res.render('index');
};

controllerTest.testDB = async (req, res, next) => {
    await db
        .any(
            `INSERT INTO test_table ("testString") VALUES ('Hello at ${Date.now()}')`,
        )
        .then((_) => db.any('SELECT * FROM test_table'))
        .then((results) => res.json(results))
        .catch((error) => {
            console.log(error);
            res.json({ error });
        });
};

controllerTest.testDBSequelizeRaw = async (req, res, next) => {
    try {
        const { username } = req.params;
        res.json(dbEngine.getUserRowByUsername(username));
    } catch (error) {
        next(error);
    }
};

module.exports = controllerTest;
