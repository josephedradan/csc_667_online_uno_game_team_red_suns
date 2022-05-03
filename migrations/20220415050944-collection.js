module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.DataTypes.INTEGER });
         */
        return queryInterface.createTable('Collection', {

            // *** THIS DOES NOT EXIST YET, THIS SHOULD BE CREATED BY THE MIGRATION card ***
            // card_id: {
            //     type: Sequelize.DataTypes.INTEGER,
            //     references: { model: 'Card', key: 'card_id' },
            //     allowNull: false,
            //     unique: true,
            // },

            // *** THIS DOES NOT EXIST YET, THIS SHOULD BE CREATED BY THE MIGRATION collection_info ***
            // Collection info id maps to a row telling you what collection the card is in
            // collection_info_id: {
            //     type: Sequelize.DataTypes.INTEGER,
            //     references: { model: 'CollectionInfo', key: 'collection_info_id' },
            //     allowNull: false,
            //     unique: false, // It's a mapping, so you can't have uniques
            // },

            player_id: { // This may or may not exist (If type is HAND then this will not be null)
                type: Sequelize.DataTypes.INTEGER,
                references: {
                    model: 'Player',
                    key: 'player_id',
                },
                onDelete: 'CASCADE',
                allowNull: true, // card may not be in user hand, it can be the deck stack or draw stack
                unique: false, // Player can have multiple cards
            },

            // Index of the card_id in the collection. The collection based on collection_info_id
            collection_index: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
                unique: false, // All collections are stored in this table
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
        return queryInterface.dropTable('Collection');
    },
};
