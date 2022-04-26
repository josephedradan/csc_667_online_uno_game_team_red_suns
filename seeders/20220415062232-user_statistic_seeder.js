/*
queryInterface.sequelize.query(
  'SELECT * FROM "Users" WHERE username = ? ', {
    replacements: ['admin'],
    type: queryInterface.sequelize.QueryTypes.SELECT
  }).then(users => {
*/
const debugPrinter = require('../util/debug_printer');

module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add seed commands here.
         *
         * Example:
         * await queryInterface.bulkInsert('People', [{
         *   name: 'John Doe',
         *   isBetaMember: false
         * }], {});
         */

        // count the num of entries in User
        const result = await queryInterface.sequelize.query('SELECT user_id FROM public."User";');

        const ids = result[0];
        console.log(ids);

        // generate their initial stats.
        ids.forEach((element) => {

        });

        const resultInsert = Promise.all(ids.map((element) => queryInterface.sequelize.query(
            `
                INSERT INTO public."UserStatistic" ("user_id", "num_wins", "num_loss") 
                VALUES ($user_id, 0, 0);
                `,
            { bind: { user_id: element.user_id } },
        )));

        return resultInsert;
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
        return queryInterface.bulkDelete('UserStatistic', null, {});
    },
};
