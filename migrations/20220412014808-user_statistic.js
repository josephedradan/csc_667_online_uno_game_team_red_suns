module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.DataTypes.INTEGER });
         */
        return queryInterface.createTable('UserStatistic', {
            // user_id is a foreign key not a primary key
            user_id: {
                type: Sequelize.DataTypes.INTEGER,
                references: { model: 'User', key: 'user_id' },
                onDelete: 'CASCADE',
                allowNull: false,
                unique: true,
            },

            num_wins: {
                type: Sequelize.DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
                unique: false,
            },

            num_loss: {
                type: Sequelize.DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
                unique: false,
            },

            date_joined: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                allowNull: false,
                unique: false,
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
        return queryInterface.dropTable('UserStatistic');
    },
};
