module.exports = {
    async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
        return await queryInterface.createTable('Cards', {

            cards_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            lobby_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'Lobby', key: 'lobby_id' },
            },

            card_state_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'CardState', key: 'card_state_id' },
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

        return await queryInterface.dropTable('Cards');
    },
};
