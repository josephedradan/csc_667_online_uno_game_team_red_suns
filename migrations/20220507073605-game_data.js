module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        return queryInterface.createTable('GameData', {

            game_id: {
                type: Sequelize.DataTypes.INTEGER,
                references: {
                    model: 'Game',
                    key: 'game_id',
                },
                onDelete: 'CASCADE',
                allowNull: false,
                unique: true,
            },

            // Current player's turn determined by the player_id
            player_id_turn: {
                type: Sequelize.DataTypes.INTEGER,
                references: {
                    model: 'Player',
                    key: 'player_id',
                },
                onDelete: 'SET NULL',
                allowNull: true,
                unique: true, // Enforce rule to prevent the same player from playing in multiple games
            },

            is_clockwise: {
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: true,
                allowNull: false,
                unique: false,
            },

            card_type_legal: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true,
                unique: false,
            },

            card_content_legal: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true,
                unique: false,
            },

            card_color_legal: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true,
                unique: false,
            },

            skip_amount: {
                type: Sequelize.DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
                unique: false,
            },

            draw_amount: {
                type: Sequelize.DataTypes.INTEGER,
                defaultValue: 1,
                allowNull: false,
                unique: false,
            },

            is_uno_available: {
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
                unique: false,
            },

            is_challenge_available: {
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false,
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
        return queryInterface.dropTable('GameData');
    },
};
