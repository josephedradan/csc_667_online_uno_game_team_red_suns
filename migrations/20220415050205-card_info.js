module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.DataTypes.INTEGER });
         */
        return queryInterface.createTable('CardInfo', {

            card_info_id: {
                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                // autoIncrement: true,
                allowNull: false,
                unique: true,
            },

            type: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique: false,
            },

            content: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique: false,
            },

            color: {
                type: Sequelize.DataTypes.STRING,
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
        return queryInterface.dropTable('CardInfo');
    },
};
