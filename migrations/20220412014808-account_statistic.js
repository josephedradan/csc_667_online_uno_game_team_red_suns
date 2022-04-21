module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        return await queryInterface.createTable('AccountStatistic', {

            // statistic_id is a foreign key not a primary key
            statistic_id: {
                type: Sequelize.INTEGER,
                references: { model: 'Account', key: 'account_id' },
                autoIncrement: true,
                allowNull: false,
                unique: true,
            },

            num_wins: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },

            num_loss: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },

            date_joined: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('NOW()'),
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
        return queryInterface.dropTable('AccountStatistic');
    },
};
