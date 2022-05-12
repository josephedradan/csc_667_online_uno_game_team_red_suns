const e = require('express');
const unoCardConstants = require('../config/constants_game_uno');

const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const specials = [
    unoCardConstants.SPECIALS_CONTENT_SKIP,
    unoCardConstants.SPECIALS_CONTENT_REVERSE,
    unoCardConstants.SPECIALS_CONTENT_DRAWTWO,
    unoCardConstants.SPECIALS_CONTENT_WILD,
    unoCardConstants.SPECIALS_CONTENT_WILDFOUR,
];
const colors = [
    unoCardConstants.CARD_COLOR_BLUE,
    unoCardConstants.CARD_COLOR_RED,
    unoCardConstants.CARD_COLOR_GREEN,
    unoCardConstants.CARD_COLOR_YELLOW,
    unoCardConstants.CARD_COLOR_BLACK,
];
const number = unoCardConstants.NUMBER;
const special = unoCardConstants.SPECIAL;

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
            unoCardConstants.SPECIALS_CONTENT_WILD,
            unoCardConstants.CARD_COLOR_BLACK,
            special,
        ),
        generateCard(
            unoCardConstants.SPECIALS_CONTENT_WILDFOUR,
            unoCardConstants.CARD_COLOR_BLACK,
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
        } else if (cards[i].content === unoCardConstants.SPECIALS_CONTENT_WILD || cards[i].content === unoCardConstants.SPECIALS_CONTENT_WILDFOUR) {
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
