const e = require('express');
const constantsGameUno = require('../config/constants_game_uno');

const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const specials = [
    constantsGameUno.CARD_CONTENT_SKIP,
    constantsGameUno.CARD_CONTENT_REVERSE,
    constantsGameUno.CARD_CONTENT_DRAWTWO,
    constantsGameUno.CARD_CONTENT_WILD,
    constantsGameUno.CARD_CONTENT_WILDFOUR,
];
const colors = [
    constantsGameUno.CARD_COLOR_BLUE,
    constantsGameUno.CARD_COLOR_RED,
    constantsGameUno.CARD_COLOR_GREEN,
    constantsGameUno.CARD_COLOR_YELLOW,
    constantsGameUno.CARD_COLOR_BLACK,
];
const number = constantsGameUno.CARD_TYPE_NUMBER;
const special = constantsGameUno.CARD_TYPE_SPECIAL;

let index = 0;

function generateCard(content, color, type) {
    const row = {
        card_info_id: index,
        content,
        color,
        type,
    };
    index += 1;

    return row;
}

function generateColoredNumCard(color, _values) {
    return values.map((content) => generateCard(content, color, number));
}

function generateColoredSpecialCards() {
    const retArr = [];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < specials.length - 2; i++) {
        // eslint-disable-next-line no-plusplus
        for (let j = 0; j < colors.length - 1; j++) {
            retArr.push(generateCard(specials[i], colors[j], special));
        }
    }

    return retArr;
}

function generateSpecialCards() {
    return [
        generateCard(
            constantsGameUno.CARD_CONTENT_WILD,
            constantsGameUno.CARD_COLOR_BLACK,
            special,
        ),
        generateCard(
            constantsGameUno.CARD_CONTENT_WILDFOUR,
            constantsGameUno.CARD_COLOR_BLACK,
            special,
        ),
    ];
}

function seedAllCards() {
    let cards = [];
    // eslint-disable-next-line prefer-const
    let inOrderDeck = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < colors.length - 1; i++) {
        cards = cards.concat(generateColoredNumCard(colors[i], values));
    }

    cards = cards.concat(generateColoredSpecialCards());
    cards = cards.concat(generateSpecialCards());

    let count = 0;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].content === '0') {
            inOrderDeck.push({
                // eslint-disable-next-line no-plusplus
                card_info_id: count++, content: cards[i].content, color: cards[i].color, type: cards[i].type,
            });
        } else if (cards[i].content === constantsGameUno.CARD_CONTENT_WILD || cards[i].content === constantsGameUno.CARD_CONTENT_WILDFOUR) {
            // eslint-disable-next-line no-plusplus
            for (let j = 0; j < 4; j++) {
                inOrderDeck.push({
                    // eslint-disable-next-line no-plusplus
                    card_info_id: count++, content: cards[i].content, color: cards[i].color, type: cards[i].type,
                });
            }
        } else if (cards[i].content !== '0') {
            // eslint-disable-next-line no-plusplus
            for (let j = 0; j < 2; j++) {
                inOrderDeck.push({
                    // eslint-disable-next-line no-plusplus
                    card_info_id: count++, content: cards[i].content, color: cards[i].color, type: cards[i].type,
                });
            }
        }
    }

    return inOrderDeck;
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
