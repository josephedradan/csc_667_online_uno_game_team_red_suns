'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return await queryInterface.createTable("Player", {
      
      player_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }, 
      
      lobby_id: {
        type: Sequelize.INTEGER, 
        allowNull: false
      }, 

      is_host: {
        type: Sequelize.BOOLEAN, 
        default: false 
      }, 

      is_out_of_game: {
        type: Sequelize.BOOLEAN,
        default: false
      }, 

      account_id: {
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: 'Account', key: 'account_id' }, 
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
    return await queryInterface.dropTable('Player');
  }
};
