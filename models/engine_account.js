const engineAccount = {}


async function getUserAndUserInformationByUsername(username) {
    try {
        const [results, metadata] = await sequelize.query(
            "SELECT * FROM `Account` WHERE Username = :Username",
            {
                replacements: {Username: username}
            }
        );
        return results
    } catch (error) {
        return null
    }

}


module.exports = engineAccount
