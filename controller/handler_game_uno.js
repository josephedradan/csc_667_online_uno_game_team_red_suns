const intermediateGameUno = require('./intermediate_game_uno');
const debugPrinter = require('../util/debug_printer');

const handlerGameUno = {};

async function getRelativeGameURL(game_id) {
    return `/game/${game_id}`;
}

handlerGameUno.getRelativeGameURL = getRelativeGameURL;

/**
 * Intermediate function creates the uno game while also append the game url to the result
 * Notes:
 *      This function was created so that req.json and res.redirect/res.render could share code
 *
 * @param user_id
 * @returns {Promise<{game: void, game_url: string}>}
 */
async function createGameWrapped(user_id) {
    debugPrinter.printFunction(createGameWrapped.name);

    const result = await intermediateGameUno.createGameV2(user_id);

    debugPrinter.printBackendBlue(result);

    const game_url = await handlerGameUno.getRelativeGameURL(result.game.game_id);

    debugPrinter.printBackendGreen(game_url);

    result.game_url = game_url;

    return result;
}

handlerGameUno.createGameWrapped = createGameWrapped;

async function joinGameWrapped(user_id) {
    debugPrinter.printFunction(joinGameWrapped.name);

    // TODO JOin game warpped
}

handlerGameUno.joinGameWrapped = joinGameWrapped;

// IGNORE
// module.exports = Object.keys(handlerGameUno)
//     .map((key, index) => {
//         debugPrinter.printFunction(key.name);
//         return key;
//     });

module.exports = handlerGameUno;
