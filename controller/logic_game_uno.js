const dbEngineGameUno = require('./db_engine_game_uno');
const debugPrinter = require('../util/debug_printer');

const logicGameUno = {};

async function createPlayer(user_id) {
    debugPrinter.printFunction(createPlayer.name);
    return dbEngineGameUno.createPlayerRow(user_id);
}

logicGameUno.createPlayer = createPlayer;

async function createGame() {
    debugPrinter.printFunction(createGame.name);
    return dbEngineGameUno.createGameRow();
}

logicGameUno.createGame = createGame;

async function addPlayerToGame(game_id, player_id, is_host) {
    debugPrinter.printFunction(addPlayerToGame.name);
    return dbEngineGameUno.createPlayersRow(game_id, player_id, is_host);
}

logicGameUno.addPlayerToGame = addPlayerToGame;

/**
 * Generate the initial cards for a game
 *
 * Notes:
 *      Create Player Row
 *      Create Game Row
 *
 *      Create Players Row (Link Player Row to Game Row. The first player should be the host)
 *
 *      Create CardState Rows
 *          Create CardState Rows based on CardState.card_state_id and CardInfo.card_info_id
 *          Create Collection Rows based on CardState.card_state_id and CollectionInfo.collection_info_id
 *          Create Cards Rows based on CardState.card_state_id and Game.game_id
 *
 *
 * @param game_id
 * @returns {Promise<void>}
 */
async function generateCardsForGame(game_id) {
    debugPrinter.printFunction(generateCardsForGame.name);

    const results = await dbEngineGameUno.createCardStateRowsAndCardsRowsAndCollectionRows(game_id, 2);
}

logicGameUno.generateCardsForGame = generateCardsForGame;

module.exports = logicGameUno;
