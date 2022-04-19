'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
      /**
       * Add altering commands here.
       *
       * Example:
       * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
       */
      return queryInterface.createTable('CardState', {

          card_state_id: {
              type: Sequelize.INTEGER,
              primaryKey: true,
              autoIncrement: true,
          },

          index: {
              type: Sequelize.INTEGER, 
              allowNull: false
          }, 

          card_id: {
              type: Sequelize.INTEGER,
              references: {model: 'Card', key: 'card_id'},
              allowNull: false,
          }, 

          stack_id: {
              type: Sequelize.INTEGER,
              references: {model: 'Stack', key: 'stack_id'},
              allowNull: false,
          }
      });
  },

  async down(queryInterface, Sequelize) {
      /**
       * Add reverting commands here.
       *
       * Example:
       * await queryInterface.dropTable('users');
       */
      return await await queryInterface.dropTable('CardState');
  }
};

