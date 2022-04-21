module.exports = {
    async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.DataTypes.INTEGER });
     */
        return queryInterface.createTable('Cards', {

            // cards_id: {
            //     type: Sequelize.DataTypes.INTEGER,
            //     primaryKey: true,
            //     autoIncrement: true,
            // },

            // What the card state is tied to
            game_id: {
                type: Sequelize.DataTypes.INTEGER,
                references: { model: 'Game', key: 'game_id' },
                allowNull: false,
                unique: false, // This table is to map the game to the card state so this should be false
            },

            card_state_id: {
                type: Sequelize.DataTypes.INTEGER,
                references: { model: 'CardState', key: 'card_state_id' },
                allowNull: false,
                unique: true, // Prevents a card state from being in more than 1 game
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

        return queryInterface.dropTable('Cards');
    },
};
