'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     return await queryInterface.createTable("Lobby", {
      
      lobby_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }, 

      is_in_game: {
        type: Sequelize.BOOLEAN, 
        default: false
      }, 

      current_player_id: {
        type: Sequelize.INTEGER, 
        references: { model: 'Player', key: 'player_id' }
      },

      host_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: { model: 'Player', key: 'player_id' }
      }
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return await queryInterface.dropTable('Lobby');
  }
};
