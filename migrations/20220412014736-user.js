const { allow } = require('joi');

module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.DataTypes.INTEGER });
         */
        return queryInterface.createTable('User', {

            user_id: {
                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                unique: true,
            },

            display_name: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique: false,
            },

            username: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique: true,
            },

            password: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique: false,
            },

        });
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        return queryInterface.dropTable('User');
    },
};
