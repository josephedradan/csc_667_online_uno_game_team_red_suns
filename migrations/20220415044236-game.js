module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        await queryInterface.createTable('Game', {

            game_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            active: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },

            current_player_id: { // current player whos in turn to play/draw etc. a card. 
                type: Sequelize.INTEGER,
                references: { model: 'Player', key: 'player_id' },
                allowNull: true
            },

            host_id: { // host of game. 
                type: Sequelize.INTEGER,
                references: { model: 'Player', key: 'player_id' },
                allowNull: false,
                unique: true
            },
        });

        // Odd return
        return await queryInterface.addColumn('Player', 'game_id', {
            type: Sequelize.INTEGER,
            references: { model: 'Game', key: 'game_id' },
            allowNull: false,
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
            'Player',
            'game_id',
        );

        return await queryInterface.dropTable('Game');
    },
};
