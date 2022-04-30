const intermediateGameUno = require('./intermediate_game_uno');
const debugPrinter = require('../util/debug_printer');

const handlerGameUno = {};

async function getRelativeGameURL(game_id) {
    return `/game/${game_id}`;
}

handlerGameUno.getRelativeGameURL = getRelativeGameURL;

/**
 * Intermediate function creates the uno game while also append the game url to the result
 *
 * Notes:
 *      This function was created so that req.json and res.redirect/res.render could share code
 *
 * @param user_id
 * @returns {Promise<{game: void, game_url: string}>}
 */
async function createGameWrapped(user_id) {
    debugPrinter.printFunction(createGameWrapped.name);

    const gameObject = await intermediateGameUno.createGameV2(user_id, 2);
    debugPrinter.printBackendBlue(gameObject);

    // If nothing returned
    if (!gameObject) {
        return null;
    }

    const game_url = await handlerGameUno.getRelativeGameURL(gameObject.game.game_id);

    debugPrinter.printBackendGreen(game_url);

    gameObject.game_url = game_url;

    return gameObject;
}

handlerGameUno.createGameWrapped = createGameWrapped;

module.exports = handlerGameUno;
