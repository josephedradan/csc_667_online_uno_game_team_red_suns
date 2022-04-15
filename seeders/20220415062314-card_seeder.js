'use strict';

const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const colors = ["blue", "red", "green", "yellow"];
const specials = ["skip", "reverse", "drawTwo"];
const wilds = ["wild", "wildFour"];

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
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
