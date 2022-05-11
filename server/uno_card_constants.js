/* eslint-disable linebreak-style */
const uno_card_constants = {};

uno_card_constants.CARD_COLOR_BLACK = 'black';
uno_card_constants.CARD_COLOR_GREEN = 'green';
uno_card_constants.CARD_COLOR_YELLOW = 'yellow';
uno_card_constants.CARD_COLOR_RED = 'red';
uno_card_constants.CARD_COLOR_BLUE = 'blue';
uno_card_constants.NUMBER = 'NUMBER';
uno_card_constants.SPECIAL = 'SPECIAL';
uno_card_constants.SPECIALS_CONTENT_SKIP = 'skip';
uno_card_constants.SPECIALS_CONTENT_REVERSE = 'reverse';
uno_card_constants.SPECIALS_CONTENT_DRAWTWO = 'drawTwo';
uno_card_constants.SPECIALS_CONTENT_WILD = 'wild';
uno_card_constants.SPECIALS_CONTENT_WILDFOUR = 'wildFour';

uno_card_constants.LEGAL_COLORS = [
    uno_card_constants.CARD_COLOR_BLUE,
    uno_card_constants.CARD_COLOR_RED,
    uno_card_constants.CARD_COLOR_GREEN,
    uno_card_constants.CARD_COLOR_YELLOW,
    uno_card_constants.CARD_COLOR_BLACK,
];

module.exports = uno_card_constants;
