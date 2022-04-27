module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.DataTypes.INTEGER });
         */
        return queryInterface.createTable('Game', {

            game_id: {
                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                unique: false,
                onDelete: 'CASCADE',
            },

            // Is the game being played or is it in lobby
            active: {
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
                unique: false,
            },

            // Current player's turn determined by the player_id
            current_player_id: { // TODO current_turn_player_id
                type: Sequelize.DataTypes.INTEGER,
                references: {
                    model: 'Player',
                    key: 'player_id',
                },
                allowNull: true,
                unique: true, // Enforce rule to prevent the same player from playing in multiple games
            },

            // TODO direction, clockwise or counter
            //

        });
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        return queryInterface.dropTable('Game');
    },
};
