module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.DataTypes.INTEGER });
         */
        return queryInterface.createTable('Player', {

            // One to many relationship allowing for 1 user to play multiple games vua player_id
            player_id: {
                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                unique: true,
            },

            user_id: {
                type: Sequelize.DataTypes.INTEGER,
                references: {
                    model: 'User',
                    key: 'user_id',
                },
                onDelete: 'CASCADE',
                allowNull: false,
                unique: false, // Allow 1 user to play in multiple games
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
        return queryInterface.dropTable('Player');
    },
};
