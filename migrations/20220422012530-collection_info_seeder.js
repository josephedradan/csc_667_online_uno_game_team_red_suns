module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add seed commands here.
         *
         * Example:
         * await queryInterface.bulkInsert('People', [{
         *   name: 'John Doe',
         *   isBetaMember: false
         * }], {});
         */
        return queryInterface.bulkInsert('CollectionInfo', [
            {
                collection_info_id: 1,
                type: 'DRAW',
            },
            {
                collection_info_id: 2,
                type: 'PLAY',
            },
            {
                collection_info_id: 3,
                type: 'HAND',
            },

        ]);
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
        return queryInterface.bulkDelete('CollectionInfo', null, {});
    },
};
