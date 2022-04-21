module.exports = {
    async up(queryInterface, Sequelize) {
        /**
       * Add altering commands here.
       *
       * Example:
       * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
       */
        return await queryInterface.createTable('Collection', {

            collection_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            type: {
                type: Sequelize.STRING, // DRAW || PLAY || HAND
                allowNull: false,
            },

            player_id: { // This may or may not exist (If type is HAND then this will not be null)
                type: Sequelize.INTEGER,
                references: { model: 'Player', key: 'player_id' },
                allowNull: true,
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
        return await queryInterface.dropTable('Collection');
    },
};
