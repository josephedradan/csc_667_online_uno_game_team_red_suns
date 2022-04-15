'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return await queryInterface.createTable('Card', { 
      
      card_id: {
        type: Sequelize.INTEGER, 
        primaryKey: true,
        autoIncrement: true
      }, 

      type: {
        type: Sequelize.STRING, 
        allowNull: false, 
      }, 

      content: {
        type: Sequelize.STRING, 
        allowNull: false
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
    return await queryInterface.dropTable('Card');
  }
};
