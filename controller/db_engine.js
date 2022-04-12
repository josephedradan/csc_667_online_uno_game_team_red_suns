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
const passwordHandler = require("./handler_password");
const debugPrinter = require("../util/debug_printer"); 

// const { QueryTypes } = require('sequelize');

async function getAccountAndAccountStatisticsByUsername(username) {
    debugPrinter.printBackendBlue("calling dbEngine.getAccountAndAccountStatisticsByUsername()"); 
    return await db.any(
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
}
dbEngine.getAccountAndAccountStatisticsByUsername = getAccountAndAccountStatisticsByUsername; 

async function getAccountByUsername(username){
    debugPrinter.printBackendBlue("in dbEngine.getAccountByUsername()"); 
    return await db.any(
        `SELECT account.username, account.password, account.account_id 
        FROM public."Account" account WHERE account.username = $1;`, 
        [
            username
        ]
    )
    
}
dbEngine.getAccountByUsername = getAccountByUsername;

async function insertAccount(username, password) { 
    debugPrinter.printBackendBlue("in dbEngine.insertAccount()"); 
    await db.any(
        `
        INSERT INTO public."Account"(
            username, password)
        VALUES ($1, $2);

        INSERT INTO public."AccountStatistic"(
            "num_wins", "num_loss")
        VALUES (0, 0);
        `, 
        [
            username, 
            password
        ]
    )
}
dbEngine.insertAccount = insertAccount;

module.exports = dbEngine
