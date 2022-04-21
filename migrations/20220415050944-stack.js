module.exports = {
    async up(queryInterface, Sequelize) {
        /**
       * Add altering commands here.
       *
       * Example:
       * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
       */
        return await queryInterface.createTable('Stack', {

            stack_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            player_id: {
                type: Sequelize.INTEGER,
                references: { model: 'Player', key: 'player_id' },
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
        return await queryInterface.dropTable('Stack');
    },
};
