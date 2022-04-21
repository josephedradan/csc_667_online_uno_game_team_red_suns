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
            },

            // Current player's turn determined by the player_id
            current_player_id: {
                type: Sequelize.DataTypes.INTEGER,
                references: {
                    model: 'Player',
                    key: 'player_id',
                },
                allowNull: true,
                unique: true, // Enforce rule to prevent the same player from playing in multiple games
            },

        });

        // // Odd return
        // return queryInterface.addColumn('Player', 'game_id', {
        //     type: Sequelize.DataTypes.INTEGER,
        //     references: {
        //         model: 'Game',
        //         key: 'game_id',
        //     },
        //     allowNull: false,
        // });
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        // await queryInterface.removeColumn(
        //     'Player',
        //     'game_id',
        // );

        return queryInterface.dropTable('Game');
    },
};
