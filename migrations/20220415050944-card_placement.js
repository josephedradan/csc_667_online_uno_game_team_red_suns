'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        return queryInterface.createTable('CardPlacement', { // FIXME: HOW DO YOU TRACK CARDS IN GAME

            placement_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            in_draw_stack: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },

            in_play_stack: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },

            player_id: {
                type: Sequelize.INTEGER,
                references: {model: 'Player', key: 'player_id'},
                allowNull: false,
            },

            lobby_id: {
                type: Sequelize.INTEGER,
                references: {model: 'Lobby', key: 'lobby_id'},
                allowNull: false,
                unique: true,
            },

            card_id: {
                type: Sequelize.INTEGER,
                references: {model: 'Card', key: 'card_id'},
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
        return await await queryInterface.dropTable('CardPlacement');
    }
};
