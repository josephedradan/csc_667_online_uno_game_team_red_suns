/*

IMPORTANT NOTES:
    THERE SHOULD BE NO SOCKET IO STUFF HERE

 */
const dbEngine = require('./db_engine');
const dbEngineGameUno = require('./db_engine_game_uno');

const debugPrinter = require('../util/debug_printer');

const intermediateGameUno = {};

// async function createPlayer(user_id) {
//     debugPrinter.printFunction(createPlayer.name);
//     return dbEngineGameUno.createPlayerRow(user_id);
// }
//
// intermediateGameUno.createPlayer = createPlayer;
//
// async function addPlayerToGame(game_id, player_id, is_host) {
//     debugPrinter.printFunction(addPlayerToGame.name);
//
//     return dbEngineGameUno.createPlayersRow(game_id, player_id, is_host);
// }
//
// intermediateGameUno.addPlayerToGame = addPlayerToGame;

/**
 * Get All games and the players in those games
 *
 * Notes:
 *      This function is not dependent on if the db is successful or not
 *
 * @returns {Promise<{game: *, players: *}[]>}
 */
async function getGamesAndTheirPlayersSimple() {
    debugPrinter.printFunction(getGamesAndTheirPlayersSimple.name);

    // May be empty
    const gameRows = await dbEngineGameUno.getGameRowsSimple();

    // May be empty
    const playerRows = await Promise.all(gameRows.map((gameRow) => dbEngineGameUno.getPlayerRowsJoinPlayersRowJoinGameRowByGameID(gameRow.game_id)));

    const gamesWithPlayersRows = gameRows.map((row, index) => ({
        game: row,
        players: playerRows[index],
    }));

    return gamesWithPlayersRows;
}

intermediateGameUno.getGamesAndTheirPlayers = getGamesAndTheirPlayersSimple;

/**
 * Notes:
 *      Do not use this in getGamesAndTheirPlayersSimple() because you will be making more db calls
 *
 *      This function is dependent on if the db is successful
 *
 * @param game_id
 * @returns {Promise<{game: *, players: *}>}
 */
async function getGameAndTheirPlayersByGameIDDetailed(game_id) {
    debugPrinter.printFunction(getGameAndTheirPlayersByGameIDDetailed.name);

    // May be undefined
    const gameRow = await dbEngineGameUno.getGameRowByGameIDDetailed(game_id);

    // If Game Row does not exist
    if (!gameRow) {
        return null;
    }

    // May be empty
    const playerRows = await dbEngineGameUno.getPlayerRowsJoinPlayersRowJoinGameRowByGameID(gameRow.game_id);

    const gameWithPlayersRows = {
        game: gameRow,
        players: playerRows,
    };

    return gameWithPlayersRows;
}

intermediateGameUno.getGameAndTheirPlayersByGameIDDetailed = getGameAndTheirPlayersByGameIDDetailed;

/**
 * Notes:
 *      This function is dependent on if the db is successful
 *
 * @param game_id
 * @returns {Promise<{defaultValue: boolean, unique: boolean, allowNull: boolean, type: *}>}
 */
async function checkIfGameIsActive(game_id) {
    debugPrinter.printFunction(checkIfGameIsActive.name);

    // May be undefined
    const result = await dbEngineGameUno.getGameRowByGameIDSimple(game_id);

    if (!result) {
        return null;
    }

    return result.is_active;
}

intermediateGameUno.checkIfGameIsActive = checkIfGameIsActive;

/**
 * Join a game
 *
 * Notes:
 *      This function is dependent on if the db is successful
 *
 * @param game_id
 * @param user_id
 * @returns {Promise<*>}
 */
async function joinGame(game_id, user_id) {
    debugPrinter.printFunction(joinGame.name);

    // May be undefined
    const playerRow = await dbEngineGameUno.createPlayerRowAndCreatePlayersRow(user_id, game_id, false);

    // If player row was not made
    if (!playerRow) {
        return null;
    }

    // This should return more info about the player, May be undefined
    const playerRowDetailed = dbEngineGameUno.getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID(game_id, user_id);

    if (!playerRowDetailed) {
        return null;
    }

    return playerRowDetailed;
}

intermediateGameUno.joinGame = joinGame;

/**
 * Leave a game
 *
 * Notes:
 *      This function is dependent on if the db is successful
 *
 * @param game_id
 * @param user_id
 * @returns {Promise<*>}
 */
async function leaveGame(game_id, user_id) {
    debugPrinter.printFunction(leaveGame.name);

    // May be undefined
    const playerRow = await dbEngineGameUno.getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID(game_id, user_id);

    // If playerRow does not exist
    if (!playerRow) {
        return null;
    }

    let result;

    if (playerRow.is_host) {
        // May be empty
        result = await dbEngineGameUno.deleteGameRow(game_id);
    } else {
        // May be empty
        result = await dbEngineGameUno.deletePlayerRowByPlayerID(playerRow.player_id);
    }

    return result;
}

intermediateGameUno.leaveGame = leaveGame;

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

// intermediateGameUno.createGame = createGame;

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
async function createGameV2(user_id, deckMultiplier) {
    debugPrinter.printFunction(createGameV2.name);
    debugPrinter.printDebug(user_id);

    // FIXME: WARNING: DANGEROUS, NOT ACID PROOF

    // May be undefined
    const playerRow = await dbEngineGameUno.createPlayerRow(user_id);
    debugPrinter.printDebug(playerRow);

    if (!playerRow) {
        return null;
    }

    // May be undefined
    const gameRow = await dbEngineGameUno.createGameRow();
    debugPrinter.printDebug(gameRow);

    if (!gameRow) {
        return null;
    }

    // May be undefined
    const playersRow = await dbEngineGameUno.createPlayersRow(gameRow.game_id, playerRow.player_id, true);
    debugPrinter.printDebug(playersRow);

    if (!playersRow) {
        return null;
    }

    // May be empty
    const cardStateRows = await dbEngineGameUno.createCardStateRowsAndCardsRowsAndCollectionRowsWithCollectionRandomized(gameRow.game_id, deckMultiplier);
    debugPrinter.printDebug(cardStateRows);

    // Basically if no rows created
    if (!cardStateRows.length) {
        return null;
    }

    return {
        player: playerRow,
        game: gameRow,
        players: playersRow,
        cardStateRows,
    };
}

intermediateGameUno.createGameV2 = createGameV2;

/*
game_state

Notes:
    This should not show any information about the actual card itself

{
    game: {
        game_id,
        is_active,
        player_id_current_turn,
        is_clockwise,
    },
    players:
        [
            {
                display_name,
                game_id,
                is_host,
                num_loss,
                num_wins,
                player_id,
                user_id,
                collection:
                    [
                        {collection_index: 0},
                        {collection_index: 1},
                        {collection_index: 2},
                        {collection_index: 3},
                        {collection_index: 4},
                        ...
                    ]
            },
            ...
        ],
    ],
}
 */

/**
 *
 * @param game_id
 * @returns {Promise<void>}
 */
async function getGameState(game_id) {

    // May be undefined
    const gameRow = await dbEngineGameUno.getGameRowByGameIDDetailed(game_id);

    // If Game Row does not exist
    if (!gameRow) {
        return null;
    }

    // May be empty
    const playerRows = await dbEngineGameUno.getPlayerRowsJoinPlayersRowJoinGameRowByGameID(gameRow.game_id);


    // May be empty
    // const playerRows = await Promise.all(gameRows.map((gameRow) => dbEngineGameUno.getPlayerRowsJoinPlayersRowJoinGameRowByGameID(gameRow.game_id)));

    const gamesWithPlayersRows = gameRows.map((row, index) => ({
        game: row,
        players: playersRows[index],
    }));

}

module.exports = intermediateGameUno;

// TODO REASSIGN player_index WHEN A PLAYER IS OUT. BASCIALLY WHEN THEY CALLED UNO AND THEY ARE NOT A PLAYER IN THE ACTUAL PLAYING OF THE GAME
// TODO SOCKET EMIT PLAYERS IN GAME LOBBY
// TODO HANDLE PLAYER TURNS
// TODO GET TOP CARD OF DRAW COLLECTION
// TODO SET CURRENT TURN PLAYER ID
// TODO SET CLOCKWISE
// TODO CHANGE HOST
