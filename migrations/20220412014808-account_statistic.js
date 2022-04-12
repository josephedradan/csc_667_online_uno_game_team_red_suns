'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return queryInterface.createTable("AccountStatistic", {

      statistic_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      }, 

      num_wins: {
        type: Sequelize.INTEGER, 
        defaultValue: 0
      }, 

      num_loss: {
        type: Sequelize.INTEGER, 
        default: 0
      }, 


      date_joined: {
        type: Sequelize.DATE, 
        defaultValue: Sequelize.literal("NOW()"),
        allowNull: false
      }, 

      account_id: {
        type: Sequelize.INTEGER, 
        references: { model: 'Account', key: 'account_id' }, 
        unique: true
      }

    }); 
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.dropTable("AccountStatistic"); 
  }
};
