module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.DataTypes.INTEGER });
         */

        await queryInterface.createTable('CollectionInfo', {

            collection_info_id: {
                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                // autoIncrement: true,
                allowNull: false,
                unique: true,
            },

            // Where this card is in
            type: {
                type: Sequelize.DataTypes.STRING, // DRAW || PLAY || HAND
                allowNull: false,
                unique: true,
            },

        });

        return queryInterface.addColumn('Collection', 'collection_info_id', {
            type: Sequelize.DataTypes.INTEGER,
            references: {
                model: 'CollectionInfo',
                key: 'collection_info_id',
            },
            onDelete: 'CASCADE',
            allowNull: false,
            unique: false, // It's a mapping so you can't have uniques
        });
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */

        await queryInterface.removeColumn(
            'Collection',
            'collection_info_id',
        );

        return queryInterface.dropTable('CollectionInfo');
    },
};
