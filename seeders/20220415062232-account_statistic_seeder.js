'use strict';

/*
queryInterface.sequelize.query(
  'SELECT * FROM "Users" WHERE username = ? ', {
    replacements: ['admin'],
    type: queryInterface.sequelize.QueryTypes.SELECT
  }).then(users => {
*/
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    
    // count the num of entries in Account
    const data = await queryInterface.sequelize.query('SELECT COUNT(*) FROM public."Account";');
    const numSeededAccounts = data[0][0].count


    // generate their initial stats. 
    const generateStats = async (numSeedsAcc) => {
      for (let i = 0; i < numSeedsAcc; i++) {
        await queryInterface.sequelize.query('INSERT INTO public."AccountStatistic" ("num_wins", "num_loss") VALUES (0, 0);');
      }
    }

    return generateStats(numSeededAccounts); 
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return await queryInterface.bulkDelete('AccountStatistic', null, {});
  }
};
