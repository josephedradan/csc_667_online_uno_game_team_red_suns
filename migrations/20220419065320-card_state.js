module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.DataTypes.INTEGER });
         */
        return queryInterface.createTable('CardState', {

            card_state_id: {
                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                unique: true,
            },

            // Index of the
            // index: {
            //     type: Sequelize.DataTypes.INTEGER,
            //     allowNull: false,
            // },

            // Information about what kind of card this card state is
            card_info_id: {
                type: Sequelize.DataTypes.INTEGER,
                references: {
                    model: 'CardInfo',
                    key: 'card_info_id',
                },
                allowNull: false, // Required
                unique: false, // False because you can have duplicates of a card in a game as well as this table tracks all the card states throughout all games
            },

            // Where this card is in
            // collection_id: {
            //     type: Sequelize.DataTypes.INTEGER,
            //     references: { model: 'Collection', key: 'collection_id' },
            //     allowNull: false,
            // },
        });
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        return queryInterface.dropTable('CardState');
    },
};
