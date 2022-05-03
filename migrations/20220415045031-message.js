module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.DataTypes.INTEGER });
         */
        return queryInterface.createTable('Message', {

            message_id: {
                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                unique: true,
            },

            game_id: {
                type: Sequelize.DataTypes.INTEGER,
                references: {
                    model: 'Game',
                    key: 'game_id',
                },
                onDelete: 'CASCADE',
                allowNull: false,
                unique: false, // Allows for multiple messages for a game
            },

            player_id: {
                type: Sequelize.DataTypes.INTEGER,
                references: {
                    model: 'Player',
                    key: 'player_id',
                },
                onDelete: 'CASCADE',
                allowNull: false,
                unique: false, // Allows a user to send multiple messages
            },

            message: { // what was sent
                type: Sequelize.TEXT,
                allowNull: false,
                unique: false,
            },

            time_stamp: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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
        return queryInterface.dropTable('Message');
    },
};
