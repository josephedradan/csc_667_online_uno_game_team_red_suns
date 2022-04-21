const db = require('../db');
const dbEngine = require('./db_engine');

contollerIndex = {};

contollerIndex.testDB = async (req, res, next) => {
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

contollerIndex.testDBSequelizeRaw = async (req, res, next) => {
    try {
        const { username } = req.params;
        res.json(dbEngine.getAccountByUsername(username));
    } catch (error) {
        next(error);
    }
};

module.exports = contollerIndex;
