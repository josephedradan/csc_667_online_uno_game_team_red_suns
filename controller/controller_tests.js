const db = require("../db");


contollerIndex = {}

async function testDB(request, response) {
    await db
        .any(
            `INSERT INTO test_table ("testString") VALUES ('Hello at $ {Date.now()}')`
        )
        .then((_) => db.any(`SELECT * FROM test_table`))
        .then((results) => response.json(results))
        .catch((error) => {
            console.log(error);
            response.json({error});
        });
}

contollerIndex.testDB = testDB

module.exports = contollerIndex
