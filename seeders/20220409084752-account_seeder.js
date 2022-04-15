/*
Notes:
    This file is auto generated via the below command
        npx sequelize-cli seed:generate --name initialize-demo-users

    The comments in this file are not auto generated.

    When the command to create this file was executed, it should be blank. You need to file this
    file out with data for the initial users

    Call the below command to add whatever is in this file to the DB
        db:seed:migrate

Reference:
    Node Sequelize tutorial with Postgres | Sequelize migrations and seed data
        Notes:
            Tutorial on Sequelize migrations and more

        Reference:
            https://www.youtube.com/watch?v=Eu-h3iUk45o
 */
'use strict';

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
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
    }
};
