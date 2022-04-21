module.exports = {
    async up(queryInterface, Sequelize) {
        /**
       * Add altering commands here.
       *
       * Example:
       * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
       */
        return queryInterface.createTable('CardState', {

            card_state_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            index: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },

            // What type of card it is
            card_info_id: {
                type: Sequelize.INTEGER,
                references: { model: 'CardInfo', key: 'card_info_id' },
                allowNull: false,
            },

            // Where this card is in
            collection_id: {
                type: Sequelize.INTEGER,
                references: { model: 'Collection', key: 'collection_id' },
                allowNull: false,
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
        return await await queryInterface.dropTable('CardState');
    },
};
