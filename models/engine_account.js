/*

Reference:
    Replacements
        Notes:
            Sequelize Replacements (Raw queries with inputs)
        Reference:
            https://sequelize.org/docs/v6/core-concepts/raw-queries/#replacements
 */
const engineAccount = {}

const sequelize = require("../config/database_sequelize")

// TODO: REMOVE THIS COMMENT IF THE FUNCTION BELOW HAS BEEN TESTED AND WORKS
async function getAccountAndAccountStatistics(username) {
    throw "DON'T BOTHER CALLING THIS FUNCTION UNLESS THE DB NAMING IS GOOD AND THAT YOU FIXED THIS QUERY CORRESPONDINGLY"
    try {
        const [results, metadata] = await sequelize.query(
            `
            SELECT * 
            FROM Account
            LEFT JOIN AccountStatistics ON Account.Account_ID=AccountStatistics.Statistic_ID
            WHERE Username = :Username
            `,
            {
                replacements: {Username: username}
            }
        );
        return results
    } catch (error) {
        return null
    }

}

engineAccount.getAccountAndAccountStatistics = getAccountAndAccountStatistics

// TODO: REMOVE THIS COMMENT IF THE FUNCTION BELOW HAS BEEN TESTED AND WORKS
async function getAccountByUsername(username){
    throw "DON'T BOTHER CALLING THIS FUNCTION UNLESS THE DB NAMING IS GOOD AND THAT YOU FIXED THIS QUERY CORRESPONDINGLY"
    try {
        const [results, metadata] = await sequelize.query(
            `
            SELECT *
            FROM Account 
            WHERE Username = :Username
            `,
            {
                replacements: {Username: username}
            }
        );
        return results
    } catch (error) {
        return null
    }
}
engineAccount.getAccountByUsername = getAccountByUsername

module.exports = engineAccount
