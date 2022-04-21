module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        return await queryInterface.createTable('Player', {

            player_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            in_game: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },

            account_id: {
                type: Sequelize.INTEGER,
                references: { model: 'User', key: 'user_id' },
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
        return await queryInterface.dropTable('Player');
    },
};
