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

// TODO: REMOVE THIS COMMENT IF THIS HAS BEEN TESTED AND WORKS
async function getAccount(username) {
    try {
        const [results, metadata] = await sequelize.query(
            `
            SELECT * 
            FROM 'Account' 
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

engineAccount.getAccount = getAccount

module.exports = engineAccount
