/*

IMPORTANT NOTES:
    THERE SHOULD BE NO SOCKET IO STUFF HERE

TODO: FIX CONSISTENCY IN RETURNS

 */
const dbEngine = require('./db_engine');
const dbEngineGameUno = require('./db_engine_game_uno');

const debugPrinter = require('../util/debug_printer');
const constants = require('../server/constants');

const gameUno = {};

/**
 * Get All games and the players in those games
 *
 * Notes:
 *      This function is not dependent on if the db is successful or not
 *
 * @returns {Promise<{game: *, players: *}[]>}
 */
async function getGamesWithTheirPlayersSimple() {
    debugPrinter.printFunction(getGamesWithTheirPlayersSimple.name);

    const result = {
        status: null,
        message: null,
        games: null,
    };

    // May be empty
    const gameRowsSimple = await dbEngineGameUno.getGameRowsSimple();

    // May be empty
    const playerRows = await Promise.all(gameRowsSimple.map((gameRow) => dbEngineGameUno.getPlayerRowsJoinPlayersRowJoinGameRowByGameID(gameRow.game_id)));

    const gamesWithPlayersRows = gameRowsSimple.map((row, index) => ({
        game: row,
        players: playerRows[index],
    }));

    result.status = constants.SUCCESS;
    result.message = 'You got all the games';
    result.games = gamesWithPlayersRows;

    return result;
}

gameUno.getGamesWithTheirPlayersSimple = getGamesWithTheirPlayersSimple;

/**
 * Notes:
 *      Do not use this in getGamesWithTheirPlayersSimple() because you will be making more db calls
 *
 *      This function is dependent on if the db is successful
 *
 * @param game_id
 * @returns {Promise<{game: *, players: *}>}
 */
async function getGameAndTheirPlayersByGameIDDetailed(game_id) {
    debugPrinter.printFunction(getGameAndTheirPlayersByGameIDDetailed.name);

    const result = {
        status: null,
        message: null,
        game: null,
        players: null,
    };

    // May be undefined
    const gameRow = await dbEngineGameUno.getGameRowByGameIDDetailed(game_id);

    // If Game Row does not exist
    if (!gameRow) {
        result.status = constants.FAILURE;
        result.message = 'Getting game failed';
        return result;
    }
    result.game = gameRow;

    // May be empty
    const playerRows = await dbEngineGameUno.getPlayerRowsJoinPlayersRowJoinGameRowByGameID(gameRow.game_id);

    if (!playerRows) {
        result.status = constants.FAILURE;
        result.message = 'Getting players failed';
        return result;
    }
    result.players = playerRows;

    result.status = constants.SUCCESS;
    result.message = 'You got the game';

    return result;
}

gameUno.getGameAndTheirPlayersByGameIDDetailed = getGameAndTheirPlayersByGameIDDetailed;

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
async function joinGameIfPossible(game_id, user_id) {
    debugPrinter.printFunction(joinGameIfPossible.name);

    debugPrinter.printDebug(`game_id: ${game_id} user_id: ${user_id}`);

    const result = {
        status: null,
        message: null,
        player: null,
    };

    // Get player given game_id and user_id (May be undefined)
    const playerRowExists = await dbEngineGameUno.getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID(game_id, user_id);

    // If player is exists for the user for the game
    if (playerRowExists) {
        result.status = constants.FAILURE;
        result.message = `Player already exists in game ${game_id}`;
        result.player = playerRowExists;
        return result;
    }

    const gameRow = await dbEngineGameUno.getGameRowByGameIDDetailed(game_id);

    // If game is active
    if (gameRow.is_active) {
        result.status = constants.FAILURE;
        result.message = `Game ${game_id} is active`;
        return result;
    }

    // Create Player (May be undefined)
    const playerRowNew = await dbEngineGameUno.createPlayerRowAndCreatePlayersRow(user_id, game_id);

    // If player row was not made
    if (!playerRowNew) {
        debugPrinter.printError('COULD NOT MAKE NEW PLAYER ROW');
        result.status = constants.FAILURE;
        result.message = `Something went wrong on the server for game ${game_id}`;
        return result;
    }

    result.status = constants.SUCCESS;
    result.message = `Player ${playerRowNew.player_id} was made for game ${game_id}`;
    result.player = playerRowNew;

    return result;
}

gameUno.joinGameIfPossible = joinGameIfPossible;

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
        game: null,
    };

    const gameRow = await dbEngineGameUno.getGameRowByGameIDDetailed(game_id);

    if (!gameRow) {
        result.status = constants.FAILURE;
        result.message = `${game_id} does not exist`;
        return result;
    }

    // May be undefined
    const playerRow = await dbEngineGameUno.getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID(game_id, user_id);

    // If playerRow does not exist
    if (!playerRow) {
        result.status = constants.FAILURE;
        result.message = `Player ${playerRow.player_id} does not exist for game ${game_id}`;
        return result;
    }

    if (playerRow.player_id === gameRow.player_id_host) {
        // May be empty
        result.game = await dbEngineGameUno.deleteGameRow(game_id); // Will also delete players in game
        result.message = `Player ${playerRow.player_id} was removed from game ${game_id} and game ${game_id} was removed`;
    } else {
        // May be empty
        result.player = await dbEngineGameUno.deletePlayerRowByPlayerID(playerRow.player_id);
        result.message = `Player ${playerRow.player_id} was removed from game ${game_id}`;
    }

    result.status = constants.SUCCESS;

    return result;
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
 *      Create Card Rows
 *          Create Card Rows based on Card.card_id and CardInfo.card_info_id
 *          Create Cards Rows based on Card.card_id and Game.game_id
 *          Create Collection Rows based on Card.card_id and CollectionInfo.collection_info_id
 *
 * @param game_id
 * @returns {Promise<void>}
 */
async function createGame(user_id) {
    debugPrinter.printFunction(createGame.name);
    debugPrinter.printDebug(user_id);

    // FIXME: WARNING: DANGEROUS AND NOT ACID PROOF

    const playerRow = await dbEngineGameUno.createPlayerRow(user_id);
    debugPrinter.printDebug(playerRow);

    const gameRow = await dbEngineGameUno.createGameRow(playerRow.player_id);
    debugPrinter.printDebug(gameRow);

    const playersRow = await dbEngineGameUno.createPlayersRow(gameRow.game_id, playerRow.player_id);
    debugPrinter.printDebug(playersRow);

    const cardRows = await dbEngineGameUno.createCardRowsAndCardsRows(gameRow.game_id, 2);
    debugPrinter.printDebug(cardRows);

    // TODO: ADDING TO THE Collection IS NOT WRITTEN, WRITE THE ALGO TO SHUFFLE THE CARDS IN THE DECk
    // dbEngineGameUno.createCollectionRow(card_id, collection_info_id, collection_index);

    const cardRowsShuffled = await shuffleArray(cardRows);
    const collection = await Promise.all(cardRowsShuffled.map((element, index) => dbEngineGameUno.createCollectionRow(cardRowsShuffled[index].card_id, 1, index)));

    return {
        player: playerRow,
        game: gameRow,
        players: playersRow,
        cardRows,
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
 *      Order:
 *          Create Player Row
 *          Create Game Row (Set the player_id_host of the game to the player_id of the Player row)
 *
 *          Create Players Row
 *
 *      Return format:
 *          {
 *              player,
 *              game,
 *              players,
 *          }
 *
 * @param user_id
 * @param deckMultiplier
 */
async function createGameV2(user_id) {
    debugPrinter.printFunction(createGameV2.name);

    const result = {
        status: null,
        message: null,
        player: null,
        game: null,
        players: null,
    };

    // FIXME: WARNING: DANGEROUS, NOT ACID PROOF

    // May be undefined
    const playerRow = await dbEngineGameUno.createPlayerRow(user_id);
    debugPrinter.printDebug(playerRow);

    if (!playerRow) {
        result.status = constants.FAILURE;
        result.message = 'Could not create player row';
        return result;
    }
    result.game = playerRow;

    // May be undefined
    const gameRow = await dbEngineGameUno.createGameRow(playerRow.player_id);
    debugPrinter.printDebug(gameRow);

    if (!gameRow) {
        result.status = constants.FAILURE;
        result.message = 'Could not create game row';
        return result;
    }
    result.game = gameRow;

    // May be undefined
    const playersRow = await dbEngineGameUno.createPlayersRow(gameRow.game_id, playerRow.player_id);
    debugPrinter.printDebug(playersRow);

    if (!playersRow) {
        result.status = constants.FAILURE;
        result.message = 'Could not create players row';
        return result;
    }

    result.players = playersRow;

    result.status = constants.SUCCESS;
    result.message = 'Player, game, and players created';

    return result;
}

gameUno.createGameV2 = createGameV2;

/**
 * Start the game
 *
 * Notes:
 *      Order:
 *          Get the game row
 *          Set game to active
 *
 *          Create Card Rows
 *              Create Card Rows based on Card.card_id and CardInfo.card_info_id
 *              Create Cards Rows based on Card.card_id and Game.game_id
 *              Create Collection Rows based on Card.card_id and CollectionInfo.collection_info_id
 *                  (Cards are randomized)
 *
 * @param game_id
 * @param player_id
 * @returns {Promise<null|{game: null, message: null, status: null}>}
 */
async function startGame(game_id, player_id, deckMultiplier) {
    debugPrinter.printFunction(startGame.name);

    // TODO: Assign initial cards to players
    // TODO: Assign player_index to players so you know the turn order

    const result = {
        status: null,
        message: null,
        game: null,
        cards: null,
    };

    const gameRow = await dbEngineGameUno.getGameRowByGameIDDetailed(game_id);

    if (!gameRow) {
        result.status = constants.FAILURE;
        result.message = 'Game does not exist';
        return result;
    }

    result.game = gameRow;

    if (gameRow.player_id_host !== player_id) {
        result.status = constants.FAILURE;
        result.message = 'player_id is not player_id_host';
        return result;
    }

    // If player_id is host and if game is not active, make it active
    if (gameRow.is_active === true) {
        result.status = constants.FAILURE;
        result.message = 'Game is already active';
        return result;
    }

    await dbEngineGameUno.updateGameIsActiveByGameID(game_id, true);

    // May be empty
    const cardRows = await dbEngineGameUno.createCardRowsAndCardsRowsAndCollectionRowsWithCollectionRandomized(gameRow.game_id, deckMultiplier);
    debugPrinter.printDebug(cardRows);

    // Basically if cards not created
    if (!cardRows.length) {
        result.status = constants.FAILURE;
        result.message = 'Game is probably broken';
        return result;
    }

    result.cards = cardRows; // In this case, cardsRows is not cards, but cardRows is cards

    result.status = constants.SUCCESS;
    result.message = `Game ${game_id} is not active`;

    return result;
}

gameUno.startGame = startGame;

/*
game_state

Notes:
    This should not show any information about the actual cards, but only for the

{
    game:
        {
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
    collection_draw:
        [
            {collection_index: 0},
            {collection_index: 1},
            {collection_index: 2},
            {collection_index: 3},
            {collection_index: 4},
            ...
        ],
    collection_play:
        [
            {
                game_id,
                card_info_type,
                card_color,
                card_content,
                player_id: null,
                collection_index,
                card_id,
                collection_info_id,
                card_info_id,
                collection_info_type,
            },
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
    // May be undefined
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

    // May be empty
    const drawRows = await dbEngineGameUno.getCollectionCollectionIndexRowsDrawByGameID(game_id);

    // May be empty
    const playRows = await dbEngineGameUno.getCollectionByGameIDAndCollectionInfoID(game_id, 2);

    // Game state
    return {
        game: gameRow,
        players: playerRows,
        collection_draw: drawRows,
        collection_play: playRows,
    };
}

gameUno.getGameState = getGameState;

async function drawCardDeckToHand(game_id, player_id) { // TODO ADD MORE GUARDING AND ERROR CHECKING ETC
    debugPrinter.printFunction(drawCardDeckToHand.name);

    const result = await dbEngineGameUno.updateCollectionRowDrawToHandByPlayerID(game_id, player_id);

    if (!result) {
        return null;
    }

    return result;
}

gameUno.drawCardDeckToHand = drawCardDeckToHand;

async function playHandToPlayDeck(game_id, collection_index, player_id) {
    debugPrinter.printFunction(playHandToPlayDeck.name);

    const result = await dbEngineGameUno.updateCollectionRowHandToPlay(game_id, collection_index, player_id);

    if (!result) {
        return null;
    }

    return result;
}

gameUno.playHandToPlayDeck = playHandToPlayDeck;

async function drawCardDeckToPlay(game_id) { // TODO ADD MORE GUARDING AND ERROR CHECKING ETC
    debugPrinter.printFunction(drawCardDeckToPlay.name);

    const result = await dbEngineGameUno.updateCollectionRowDrawToPlay(game_id);

    if (!result) {
        return null;
    }

    return result;
}

gameUno.drawCardDeckToPlay = drawCardDeckToPlay;

module.exports = gameUno;

// TODO REASSIGN player_index WHEN A PLAYER IS OUT. BASCIALLY WHEN THEY CALLED UNO AND THEY ARE NOT A PLAYER IN THE ACTUAL PLAYING OF THE GAME
// TODO SET CURRENT TURN PLAYER ID
// TODO SET CLOCKWISE
// TODO CHANGE HOST
// TODO some route about calling Uno

/// //////////
// TODO Automatic Change Host when main host leaves
// TODO ON Start game ASSIGN PLAYER INDEX
// TODO Automatically change player turn
