const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const specials = ['skip', 'reverse', 'drawTwo', 'wild', 'wildFour'];
const colors = ['blue', 'red', 'green', 'yellow', 'black'];
const NUMBER = 'NUMBER';
const SPECIAL = 'SPECIAL';

function generateCard(content, color, type) {
    return { content, color, type };
}

function generateColoredNumCard(color, _values) {
    return values.map((content) => generateCard(content, color, NUMBER));
}

function generateColoredSpecialCards() {
    const retArr = [];

    for (let i = 0; i < specials.length - 2; i++) {
        for (let j = 0; j < colors.length - 1; j++) {
            retArr.push(generateCard(specials[i], colors[j], SPECIAL));
        }
    }

    return retArr;
}

function generateSpecialCards() {
    return [{ content: 'wild', color: 'black', type: SPECIAL }, { content: 'wildFour', color: 'black', type: SPECIAL }];
}

function seedAllCards() {
    let cards = [];

    for (let i = 0; i < colors.length - 1; i++) {
        cards = cards.concat(generateColoredNumCard(colors[i], values));
    }

    cards = cards.concat(generateColoredSpecialCards());
    cards = cards.concat(generateSpecialCards());

    return cards;
}

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
        return queryInterface.bulkInsert('CardInfo', seedAllCards());
    },

    async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
        return queryInterface.bulkDelete('CardInfo', null, {});
    },
};
