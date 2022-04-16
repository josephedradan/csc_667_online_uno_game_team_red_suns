/*

Reference:
    Replacements
        Notes:
            Sequelize Replacements (Raw queries with inputs)
        Reference:
            https://sequelize.org/docs/v6/core-concepts/raw-queries/#replacements

    Bind
        Notes:
            "Bind parameters are like replacements. Except replacements are escaped and inserted into the query by
            sequelize before the query is sent to the database, while bind parameters are sent to the database
            outside the SQL query text.

            Only SQLite and PostgreSQL support bind parameters. Other dialects will insert them into the SQL query
            in the same way it is done for replacements. Bind parameters are referred to by either $1, $2, ... (numeric)
            or $key (alpha-numeric). This is independent of the dialect.
            "

            So it's safer than replacements
        Reference:
            https://sequelize.org/docs/v6/core-concepts/raw-queries/#bind-parameter

    Sequelize Tutorial: Episode 9 - SQL Injection and Raw Queries
        Notes:
            More raw query examples

        Reference:
            https://www.youtube.com/watch?v=jtVk2iUytGE

 */

// FIXME: SHOULD WE PROPAGATE ERROR OR NO?
// FIXME: INCONSISTENCY IN NAMING AND IN DB RAW QUERY WRITER

const dbEngine = {}

//const { mergeDefaults } = require("sequelize/types/utils");
const sequelize = require("../models");
const db = require("../db");
const debugPrinter = require("../util/debug_printer");

// const { QueryTypes } = require('sequelize');

/**
 * Notes:
 *      Should return a list of objects
 *
 * @param username
 * @returns {Promise<any[]>}
 */
async function getAccountAndAccountStatisticsByUsername(username) {
    debugPrinter.printFunction(getAccountAndAccountStatisticsByUsername.name);
    let result = await db.any(
        `
        SELECT * 
        FROM "Account" account
        LEFT JOIN "AccountStatistic" statistics ON account.account_id=statistics.statistic_id
        WHERE Username = $1 
        `,
        [
            username
        ]
    )
    return result[0]
}

dbEngine.getAccountAndAccountStatisticsByUsername = getAccountAndAccountStatisticsByUsername;

/**
 * Example:
 *      [ { username: 'joseph1', password: 'sdfsd', account_id: 8 } ]
 *
 * @param username
 * @returns {Promise<any>}
 */
async function getAccountByUsername(username) {
    debugPrinter.printFunction(getAccountByUsername.name);
    let result = await db.any(
        `
        SELECT account.username, account.password, account.account_id 
        FROM public."Account" AS account 
        WHERE account.username = $1;
        `,
        [
            username
        ]
    )

    return result[0] // Should be an object returned
}

dbEngine.getAccountByUsername = getAccountByUsername;


/**
 *
 * @param username
 * @param password
 * @returns {Promise<any[]>}
 */
async function createAccount(username, password) {
    debugPrinter.printFunction(createAccount.name);
    let result = await db.any(
        `
        INSERT INTO "Account" (username, password)
        VALUES ($1, $2)
        RETURNING account_id, username, password;
        `,
        [
            username,
            password
        ]
    )

    return result[0] // Should be the new object

}

dbEngine.createAccount = createAccount;

/**
 * Create account statistic given account_id, will return statistic_id
 *
 * @param account_id
 * @returns {Promise<any[]>}
 */
async function creatAccountStatistic(account_id) {
    debugPrinter.printFunction(creatAccountStatistic.name);
    let result = await db.any(
        `

        INSERT INTO "AccountStatistic" (statistic_id, num_wins, num_loss)
        VALUES ($1, 0, 0)
        RETURNING statistic_id, num_wins, num_loss, date_joined;
        `,
        [
            account_id
        ]
    )

    return result[0] // Should be the new object
}


dbEngine.creatAccountStatistic = creatAccountStatistic;

module.exports = dbEngine
