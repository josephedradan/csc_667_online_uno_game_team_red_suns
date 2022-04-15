'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     return await queryInterface.createTable("LobbyMessage", {
      
      message_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      }, 

      player_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: { model: 'Player', key: 'player_id' }
      }, 

      message: {
        type: Sequelize.TEXT, 
        allowNull: false
      }, 

      date_sent: {
        type: Sequelize.DATE, 
        defaultValue: Sequelize.NOW
      }, 

      lobby_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: { model: 'Lobby', key: 'lobby_id' }
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
    return await queryInterface.dropTable('LobbyMessages');
  }
};
