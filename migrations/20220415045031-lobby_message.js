'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
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
                autoIncrement: true
            },

            player_id: {
                type: Sequelize.INTEGER,
                references: {model: 'Player', key: 'player_id'},
                allowNull: false,
                unique: true,
            },

            message: {
                type: Sequelize.TEXT,
                allowNull: false,
            },

            date_sent: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()"),
            },

            lobby_id: {
                type: Sequelize.INTEGER,
                references: {model: 'Lobby', key: 'lobby_id'},
                allowNull: false,
                unique: true,
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
        return await queryInterface.dropTable('LobbyMessage');
    }
};
