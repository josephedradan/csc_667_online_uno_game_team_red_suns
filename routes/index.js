const express = require("express");
const router = express.Router();
const db = require("../db/index");

/* GET home page. */
router.get("/", (req, res, next) => {
    res.render("index", { title: "CSC 667 Express" });
});

router.get("/registration", (req, res, next) => {
    res.render("registration", { title: "Registration Page" });
});

router.get("/dbtest", async (request, response, next) => {
    const baseSQL = `SELECT * FROM USERS;`;

    let rows = await db.any(baseSQL);
    if (!rows) {
        // throw error here. need error class to generate logs.
    }
    // add further logic here.
    // console.log(rows);
    response.json(rows);
});

// router.get("/", (request, response) => {
//     db.any(
//         `INSERT INTO test_table ("testString") VALUES ('Hello at $
//    {Date.now()}')`
//     )
//         .then((_) => db.any(`SELECT * FROM test_table`))
//         .then((results) => response.json(results))
//         .catch((error) => {
//             console.log(error);
//             response.json({ error });
//         });
// });

module.exports = router;
