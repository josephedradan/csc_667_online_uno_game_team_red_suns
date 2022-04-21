module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        return await queryInterface.createTable('GameMessage', {

            message_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            player_id: { // who sent it
                type: Sequelize.INTEGER,
                references: { model: 'Player', key: 'player_id' },
                allowNull: false,
                unique: true,
            },

            message: { // what was sent
                type: Sequelize.TEXT,
                allowNull: false,
            },

            time_stamp: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('NOW()'),
            },

            game_id: {
                type: Sequelize.INTEGER,
                references: { model: 'Game', key: 'game_id' },
                allowNull: false,
                unique: true,
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
        return await queryInterface.dropTable('GameMessage');
    },
};
