/*

IMPORTANT NOTES:
    THERE SHOULD BE NO SOCKET IO STUFF HERE

 */
const dbEngine = require('./db_engine');
const dbEngineGameUno = require('./db_engine_game_uno');

const debugPrinter = require('../util/debug_printer');

const gameUno = {};

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
    const gameRowsSimple = await dbEngineGameUno.getGameRowsSimple();

    // May be empty
    const playerRows = await Promise.all(gameRowsSimple.map((gameRow) => dbEngineGameUno.getPlayerRowsJoinPlayersRowJoinGameRowByGameID(gameRow.game_id)));

    const gamesWithPlayersRows = gameRowsSimple.map((row, index) => ({
        game: row,
        players: playerRows[index],
    }));

    return gamesWithPlayersRows;
}

gameUno.getGamesAndTheirPlayers = getGamesAndTheirPlayersSimple;

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

    // Might be undefined
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

gameUno.getGameAndTheirPlayersByGameIDDetailed = getGameAndTheirPlayersByGameIDDetailed;

/**
 * Notes:
 *      This function is dependent on if the db is successful
 *
 * @param game_id
 * @returns {Promise<{defaultValue: boolean, unique: boolean, allowNull: boolean, type: *}>}
 */
async function checkIfGameIsActive(game_id) {
    debugPrinter.printFunction(checkIfGameIsActive.name);

    // Might be undefined
    const result = await dbEngineGameUno.getGameRowByGameIDSimple(game_id);

    if (!result) {
        return null;
    }

    return result.is_active;
}

gameUno.checkIfGameIsActive = checkIfGameIsActive;

/*
Return format
{
    status
    message
    player
{
 */
/**
 * Join a game
 *
 * Notes:
 *      This function is dependent on if the db is successful
 *
 *      Return format:
 *      {
 *          status
 *          message
 *          player
 *      {
 *
 * @param game_id
 * @param user_id
 * @returns {Promise<*>}
 */
async function joinGame(game_id, user_id) {
    debugPrinter.printFunction(joinGame.name);

    debugPrinter.printDebug(`game_id: ${game_id} user_id: ${user_id}`);

    const result = {
        status: null,
        message: null,
        player: null,
    };

    // Get player given game_id and user_id (Might be undefined)
    const playerRowTemp = await dbEngineGameUno.getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID(game_id, user_id);

    // If player is exists for the user for the game
    if (playerRowTemp) {
        result.status = 'failure';
        result.message = `Player already exists in game ${game_id}`;
        result.player = playerRowTemp;
        return result;
    }

    // Create Player (Might be undefined)
    const playerRowNew = await dbEngineGameUno.createPlayerRowAndCreatePlayersRow(user_id, game_id);

    // If player row was not made
    if (!playerRowNew) {
        debugPrinter.printError('COULD NOT MAKE NEW PLAYER ROW');
        result.status = 'failure';
        result.message = `Something went wrong on the server for game ${game_id}`;
        return result;
    }

    // This should return more info about the player, Might be undefined
    const playerRowDetailed = await dbEngineGameUno.getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID(game_id, user_id);

    if (!playerRowDetailed) {
        debugPrinter.printError('COULD NOT GET PLAYER ROW DETAILED');
        result.status = 'failure';
        result.message = `Something went wrong on the server for game ${game_id}`;
        return result;
    }

    result.status = 'success';
    result.message = `Player ${playerRowDetailed.player_id} was made for game ${game_id}`;
    result.player = playerRowDetailed;

    return result;
}

gameUno.joinGame = joinGame;

/**
 * Leave a game
 *
 * Notes:
 *      This function is dependent on if the db is successful
 *
 *      Return format:
 *      {
 *          status
 *          message
 *          player
 *      {
 *
 * @param game_id
 * @param user_id
 * @returns {Promise<*>}
 */
async function leaveGame(game_id, user_id) {
    debugPrinter.printFunction(leaveGame.name);

    const result = {
        status: null,
        message: null,
        player: null,
    };

    const gameRow = await dbEngineGameUno.getGameRowByGameIDDetailed(game_id);

    if (!gameRow) {
        result.status = 'failure';
        result.message = `${game_id} does not exist`;
        return result;
    }

    // Might be undefined
    const playerRow = await dbEngineGameUno.getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID(game_id, user_id);

    // If playerRow does not exist
    if (!playerRow) {
        result.status = 'failure';
        result.message = `Player ${playerRow.player_id} does not exist for game ${game_id}`;
        return result;
    }

    let resultDB;

    if (playerRow.player_id === gameRow.player_id_host) {
        // May be empty
        resultDB = await dbEngineGameUno.deleteGameRow(game_id); // Will also delete players in game
        result.message = `Player ${playerRow.player_id} was removed from game ${game_id} and game ${game_id} was removed`;
    } else {
        // May be empty
        resultDB = await dbEngineGameUno.deletePlayerRowByPlayerID(playerRow.player_id);
        result.message = `Player ${playerRow.player_id} was removed from game ${game_id}`;
    }

    result.status = 'success';
    result.player = playerRow;

    return resultDB;
}

gameUno.leaveGame = leaveGame;

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

    const playerRow = await dbEngineGameUno.createPlayerRow(user_id);
    debugPrinter.printDebug(playerRow);

    const gameRow = await dbEngineGameUno.createGameRow(playerRow.player_id);
    debugPrinter.printDebug(gameRow);

    const playersRow = await dbEngineGameUno.createPlayersRow(gameRow.game_id, playerRow.player_id);
    debugPrinter.printDebug(playersRow);

    const cardStateRows = await dbEngineGameUno.createCardStateRowsAndCardsRows(gameRow.game_id, 2);
    debugPrinter.printDebug(cardStateRows);

    // TODO: ADDING TO THE Collection IS NOT WRITTEN, WRITE THE ALGO TO SHUFFLE THE CARDS IN THE DECk
    // dbEngineGameUno.createCollectionRow(card_state_id, collection_info_id, collection_index);

    const cardStateRowsShuffled = await shuffleArray(cardStateRows);
    const collection = await Promise.all(cardStateRowsShuffled.map((element, index) => dbEngineGameUno.createCollectionRow(cardStateRowsShuffled[index].card_state_id, 1, index)));

    return {
        player: playerRow,
        game: gameRow,
        players: playersRow,
        cardStateRows,
        collection,
    };
}

// gameUno.createGame = createGame;

/*

 */
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
 *
 *      Return format:
 *      {
 *          player,
 *          game,
 *          players,
 *          cardStateRows,
 *      }
 *
 * @param user_id
 * @param deckMultiplier
 */
async function createGameV2(user_id, deckMultiplier) {
    debugPrinter.printFunction(createGameV2.name);
    debugPrinter.printDebug(user_id);

    // FIXME: WARNING: DANGEROUS, NOT ACID PROOF

    // Might be undefined
    const playerRow = await dbEngineGameUno.createPlayerRow(user_id);
    debugPrinter.printDebug(playerRow);

    if (!playerRow) {
        return null;
    }

    // Might be undefined
    const gameRow = await dbEngineGameUno.createGameRow(playerRow.player_id);
    debugPrinter.printDebug(gameRow);

    if (!gameRow) {
        return null;
    }

    // Might be undefined
    const playersRow = await dbEngineGameUno.createPlayersRow(gameRow.game_id, playerRow.player_id);
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

gameUno.createGameV2 = createGameV2;

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
        player_id_host,
    },
    players:
        [
            {
                display_name,
                game_id,
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
    draw:
        [
            {collection_index: 0},
            {collection_index: 1},
            {collection_index: 2},
            {collection_index: 3},
            {collection_index: 4},
            ...
        ],
    player:
        [
            {collection_index: 0},
            {collection_index: 1},
            {collection_index: 2},
            {collection_index: 3},
            {collection_index: 4},
            ...
        ]

}
 */

/**
 * Get game state by game_id
 *
 * @param game_id
 * @returns {Promise<{game: *, players: *}>}
 */
async function getGameState(game_id) {
    // Might be undefined
    const gameRow = await dbEngineGameUno.getGameRowByGameIDDetailed(game_id);

    // If Game Row does not exist
    if (!gameRow) {
        return null;
    }

    // May be empty
    const playerRows = await dbEngineGameUno.getPlayerRowsJoinPlayersRowJoinGameRowByGameID(gameRow.game_id);

    // eslint-disable-next-line no-restricted-syntax
    for (const playerRow of playerRows) {
        // eslint-disable-next-line no-await-in-loop
        playerRow.collection = await dbEngineGameUno.getCollectionCollectionIndexRowsByPlayerID(playerRow.player_id);
    }





    // Game state
    return {
        game: gameRow,
        players: playerRows,
    };
}

gameUno.getGameState = getGameState;

module.exports = gameUno;

// TODO REASSIGN player_index WHEN A PLAYER IS OUT. BASCIALLY WHEN THEY CALLED UNO AND THEY ARE NOT A PLAYER IN THE ACTUAL PLAYING OF THE GAME
// TODO HANDLE PLAYER TURNS
// TODO GET TOP CARD OF DRAW COLLECTION
// TODO SET CURRENT TURN PLAYER ID
// TODO SET CLOCKWISE
// TODO CHANGE HOST

// TODO SWITCH GAME STATE TO ACTIVE WHEN GAME STARTED
