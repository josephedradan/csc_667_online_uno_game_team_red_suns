module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('test_table', {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('NOW()'),
            allowNull: false,
        },
        testString: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
        },
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('test_table'),
};
