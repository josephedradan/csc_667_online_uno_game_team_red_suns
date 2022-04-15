'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return await queryInterface.createTable('PlayerMove', 
    { 
      
      move_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }, 
      time_exec: {
        type: Sequelize.DATE, // going to have to parse this for the time
        defaultValue: Sequelize.NOW
      },

      move: {
        type: Sequelize.STRING, 
        allowNull: false
      }, 

      card_id: {
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: 'Card', key: 'card_id' }
      },

      player_id: {
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: 'Player', key: 'player_id' }
      }, 

      lobby_id: {
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: 'Lobby', key: 'lobby_id' }
      }, 
      
    }); 
  },


  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return await queryInterface.dropTable('PlayerMove');
  }
};
