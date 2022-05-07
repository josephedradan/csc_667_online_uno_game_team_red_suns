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
            },

            // Is the game being played or is it in lobby
            is_active: {
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
                unique: false,
            },

            // Current player's turn determined by the player_id
            // player_id_turn: {
            //     type: Sequelize.DataTypes.INTEGER,
            //     references: {
            //         model: 'Player',
            //         key: 'player_id',
            //     },
            //     allowNull: true,
            //     unique: true, // Enforce rule to prevent the same player from playing in multiple games
            // },

            /*
            Host of the game

            Notes:
                Host of the game
             */
            player_id_host: {
                type: Sequelize.DataTypes.INTEGER,
                references: {
                    model: 'Player',
                    key: 'player_id',
                },
                allowNull: true, // Allow games to have no host which would allow for more expandability later on
                unique: true, // Enforce rule to prevent the same player from being a host for multiple games
            },

            // is_clockwise: {
            //     type: Sequelize.DataTypes.BOOLEAN,
            //     defaultValue: true,
            //     allowNull: false,
            //     unique: false,
            // },
            //
            // type: {
            //     type: Sequelize.DataTypes.STRING,
            //     allowNull: true,
            //     unique: false,
            // },
            //
            // content: {
            //     type: Sequelize.DataTypes.STRING,
            //     allowNull: true,
            //     unique: false,
            // },
            //
            // color: {
            //     type: Sequelize.DataTypes.STRING,
            //     allowNull: true,
            //     unique: false,
            // },

            password: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true,
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
        return queryInterface.dropTable('Game');
    },
};
