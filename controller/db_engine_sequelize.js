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

const dbEngine = {}

//const { mergeDefaults } = require("sequelize/types/utils");
const sequelize = require("../models");
const db = require("../db"); 
const passwordHandler = require("./handler_password"); 

// TODO: REMOVE THIS COMMENT IF THE FUNCTION BELOW HAS BEEN TESTED AND WORKS
dbEngine.getAccountAndAccountStatisticsByUsername = async (username) => {
    throw "DON'T BOTHER CALLING THIS FUNCTION UNLESS THE DB NAMING IS GOOD AND THAT YOU FIXED THIS QUERY CORRESPONDINGLY"
    try {
        const [results, metadata] = await sequelize.query(
            `
            SELECT * 
            FROM Account
            LEFT JOIN AccountStatistics ON Account.Account_ID=AccountStatistics.Statistic_ID
            WHERE Username = $_username
            `,
            {
                bind: {_username: username}
            }
        );
        return results
    } catch (error) {
        return null
    }

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


async function insertAccount(username, password) {
    const hashedPassword = await passwordHandler.hash(password)
    await db.any(
        `
        INSERT INTO public."Account"(
            username, password)
        VALUES ('${username}', '${hashedPassword}');

        INSERT INTO public."Account Statistics"(
            "num_wins", "num_loss")
        VALUES (0, 0);
        `
    )
}
dbEngine.insertAccount = insertAccount; 

module.exports = dbEngine
