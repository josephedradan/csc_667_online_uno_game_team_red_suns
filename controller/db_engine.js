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

// const { QueryTypes } = require('sequelize');

// TODO: REMOVE THIS COMMENT IF THE FUNCTION BELOW HAS BEEN TESTED AND WORKS
dbEngine.getAccountAndAccountStatisticsByUsername = async (username) => {
    // try {
    //     const [results, metadata] = await sequelize.query(
    //         `
    //         SELECT * 
    //         FROM "Account" account
    //         LEFT JOIN "Account Statistics" statistics ON account.account_id=statistics.statistic_id
    //         WHERE Username = $_username
    //         `,
    //         {
    //             bind: {_username: username},
    //             plain: true, 
    //             // type: QueryTypes.SELECT
    //         }
    //     );
    //     return results
    // } catch (error) {
    //     return null
    // }

    return await db.any(
        ` SELECT * 
                FROM "Account" account
                LEFT JOIN "Account Statistics" statistics ON account.account_id=statistics.statistic_id
                WHERE Username = '${username}';`
    )

}


async function getAccountByUsername(username){
    try {

        console.log("in Account.getAccountByUsername")
        return await db.any(
            `SELECT account.username, account.password, account.account_id 
            FROM public."Account" account WHERE account.username = '${username}';`
        )
        /*
        const [results, metadata] = await sequelize.query(
            `
            SELECT *
            FROM Account
            WHERE Username = _username
            `,
            {
                bind: {_username: username}
            }
        );
        return results
        */
    } catch (error) {
        console.log(error)
        return null
    }
}
dbEngine.getAccountByUsername = getAccountByUsername;

async function insertAccount(username, password) { // FIXME UNSAFE AND NOT EXPLICIT IF FUNCTION WAS SUCCESSFUL
    await db.any(
        `
        INSERT INTO public."Account"(
            username, password)
        VALUES ('${username}', '${password}');

        INSERT INTO public."Account Statistics"(
            "num_wins", "num_loss")
        VALUES (0, 0);
        `
    )
}
dbEngine.insertAccount = insertAccount;

module.exports = dbEngine
