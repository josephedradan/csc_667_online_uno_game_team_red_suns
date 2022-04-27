const dbEngineGameUno = require('./db_engine_game_uno');
const debugPrinter = require('../util/debug_printer');

const logicGameUno = {};

// async function createPlayer(user_id) {
//     debugPrinter.printFunction(createPlayer.name);
//     return dbEngineGameUno.createPlayerRow(user_id);
// }
//
// logicGameUno.createPlayer = createPlayer;
//
// async function addPlayerToGame(game_id, player_id, is_host) {
//     debugPrinter.printFunction(addPlayerToGame.name);
//
//     return dbEngineGameUno.createPlayersRow(game_id, player_id, is_host);
// }
//
// logicGameUno.addPlayerToGame = addPlayerToGame;

async function joinGame(game_id, user_id) {
    const players = await dbEngineGameUno.createPlayerRowAndCreatePlayersRow(user_id, game_id, false);
    return dbEngineGameUno.getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID(game_id, user_id);
}

logicGameUno.joinGame = joinGame;

/**
 * Given an array, shuffle it
 *
 * @param array
 * @returns {Promise<*>}
 */
async function shuffleArray(array) {
    let itemTemp;

    // eslint-disable-next-line no-plusplus
    for (let i = array.length - 1; i > 0; i--) {
        const indexRandom = Math.floor(Math.random() * (i + 1));

        itemTemp = array[i];

        // Swap items at index location
        // eslint-disable-next-line no-param-reassign
        array[i] = array[indexRandom];
        // eslint-disable-next-line no-param-reassign
        array[indexRandom] = itemTemp;
    }
    return array;
}

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
 *          Create Cards Rows based on CardState.card_state_id and Game.game_id
 *          Create Collection Rows based on CardState.card_state_id and CollectionInfo.collection_info_id
 *
 * @param game_id
 * @returns {Promise<void>}
 */
async function createGame(user_id) {
    debugPrinter.printFunction(createGame.name);
    debugPrinter.printDebug(user_id);

    // WARNING: DANGEROUS AND NOT ACID PROOF

    const player = await dbEngineGameUno.createPlayerRow(user_id);
    debugPrinter.printDebug(player);

    const game = await dbEngineGameUno.createGameRow();
    debugPrinter.printDebug(game);

    const players = await dbEngineGameUno.createPlayersRow(game.game_id, player.player_id, true);
    debugPrinter.printDebug(players);

    const cardStateRows = await dbEngineGameUno.createCardStateRowsAndCardsRows(game.game_id, 2);
    debugPrinter.printDebug(cardStateRows);

    // TODO: ADDING TO THE Collection IS NOT WRITTEN, WRITE THE ALGO TO SHUFFLE THE CARDS IN THE DECk
    // dbEngineGameUno.createCollectionRow(card_state_id, collection_info_id, collection_index);

    const cardStateRowsShuffled = await shuffleArray(cardStateRows);
    const collection = await Promise.all(cardStateRowsShuffled.map((element, index) => dbEngineGameUno.createCollectionRow(cardStateRowsShuffled[index].card_state_id, 1, index)));

    return {
        player,
        game,
        players,
        cardStateRows,
        collection,
    };
}

// logicGameUno.createGame = createGame;

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
 *          Create Cards Rows based on CardState.card_state_id and Game.game_id
 *          Create Collection Rows based on CardState.card_state_id and CollectionInfo.collection_info_id
 *
 * @param game_id
 * @returns {Promise<void>}
 */
async function createGameV2(user_id) {
    debugPrinter.printFunction(createGameV2.name);
    debugPrinter.printDebug(user_id);

    // WARNING: DANGEROUS AND NOT ACID PROOF

    const player = await dbEngineGameUno.createPlayerRow(user_id);
    debugPrinter.printDebug(player);

    const game = await dbEngineGameUno.createGameRow();
    debugPrinter.printDebug(game);

    const players = await dbEngineGameUno.createPlayersRow(game.game_id, player.player_id, true);
    debugPrinter.printDebug(players);

    const cardStateRows = await dbEngineGameUno.createCardStateRowsAndCardsRowsAndCollectionRowsWithCollectionRandomized(game.game_id, 2);
    debugPrinter.printDebug(cardStateRows);

    return {
        player,
        game,
        players,
        cardStateRows,
    };
}

logicGameUno.createGameV2 = createGameV2;

module.exports = logicGameUno;
