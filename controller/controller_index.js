const db = require("../db/index");
const controllerIndex = {}


function renderIndex(req, res, next) {
    res.render("index", {title: "CSC 667 Express"})
}

controllerIndex.renderIndex = renderIndex

function renderRegistration(req, res, next) {
    res.render("registration", {title: "Registration Page"});
}

controllerIndex.renderRegistration = renderRegistration

async function testDB(request, response, next) {
    const baseSQL = `SELECT * FROM USERS;`;

    let rows = await db.any(baseSQL);
    if (!rows) {
        // throw error here. need error class to generate logs.
    }
    // add further logic here.
    // console.log(rows);
    response.json(rows);
}

controllerIndex.testDB = testDB

module.exports = controllerIndex;
