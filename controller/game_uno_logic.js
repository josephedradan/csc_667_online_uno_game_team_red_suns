/*

IMPORTANT NOTES:
    THERE SHOULD BE NO SOCKET IO STUFF HERE

TODO: FIX CONSISTENCY IN RETURNS

 */
const dbEngine = require('./db_engine');
const dbEngineGameUno = require('./db_engine_game_uno');

const gameUnoLogicHelper = require('./game_uno_logic_helper');

const constants = require('../config/constants');
const constantsGameUno = require('../config/constants_game_uno');

const debugPrinter = require('../util/debug_printer');

const gameUnoLogic = {};

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
        status_game_uno: null,
        message: null,
        games: null,
    };

    // Get games (May be empty)
    const gameRowsSimple = await dbEngineGameUno.getGameRowsSimple();

    // Get players for each game (May be empty)
    const playerRows = await Promise.all(gameRowsSimple.map((gameRow) => dbEngineGameUno.getPlayerRowsDetailedByGameID(gameRow.game_id)));

    const gamesWithPlayersRows = gameRowsSimple.map((row, index) => ({
        game: row,
        players: playerRows[index],
    }));

    result.games = gamesWithPlayersRows;

    result.status_game_uno = constants.SUCCESS;
    result.message = 'Games with their players returned';

    return result;
}

gameUnoLogic.getGamesWithTheirPlayersSimple = getGamesWithTheirPlayersSimple;

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
        status_game_uno: null,
        message: null,
        game: null,
        players: null,
    };

    // Get game (May be undefined)
    const gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // If Game Row does not exist
    if (!gameRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    result.game = gameRowDetailed;

    // Get players (May be empty)
    const playerRows = await dbEngineGameUno.getPlayerRowsDetailedByGameID(gameRowDetailed.game_id);

    if (!playerRows.length) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Error no players for game ${game_id}`;
        return result;
    }
    result.players = playerRows;

    result.status_game_uno = constants.SUCCESS;
    result.message = `Game ${game_id} and its players returned`;

    return result;
}

gameUnoLogic.getGameAndTheirPlayersByGameIDDetailed = getGameAndTheirPlayersByGameIDDetailed;

async function getGame(game_id) {
    debugPrinter.printFunction(getGame.name);

    const result = {
        status_game_uno: null,
        message: null,
        game: null,
    };

    // May be undefined
    const gameRowDetailed = await dbEngineGameUno.getGameRowSimpleByGameID(game_id);

    // If Game Row does not exist
    if (!gameRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    result.game = gameRowDetailed;

    result.status_game_uno = constants.SUCCESS;
    result.message = `Game ${game_id} returned`;

    return result;
}

gameUnoLogic.getGame = getGame;

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
async function joinGameIfPossible(user_id, game_id) {
    debugPrinter.printFunction(joinGameIfPossible.name);

    // debugPrinter.printDebug(`game_id: ${game_id} user_id: ${user_id}`);

    const result = {
        status_game_uno: null,
        message: null,
        game: null,
        player: null,
    };

    // Get game (May be Undefined)
    const gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // Check if game exists
    if (!gameRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    result.game = gameRowDetailed;

    // If game is active
    if (gameRowDetailed.is_active) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${game_id} is active`;
        return result;
    }

    // Get player (May be undefined)
    const playerRowDetailedExists = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(user_id, game_id);

    // debugPrinter.printDebug(playerRowDetailedExists);

    // If player is exists for the user for the game
    if (playerRowDetailedExists) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Player ${playerRowDetailedExists.player_id} already exists for game ${game_id}`;
        result.player = playerRowDetailedExists;
        return result;
    }

    // Create Player (May be undefined)
    const playerRowDetailedNew = await dbEngineGameUno.createPlayerRowAndCreatePlayersRow(user_id, game_id);

    // If player row was not made
    if (!playerRowDetailedNew) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Player could not join game ${game_id}`;
        return result;
    }

    result.player = playerRowDetailedNew;

    result.status_game_uno = constants.SUCCESS;
    result.message = `Player ${playerRowDetailedNew.player_id} was created and joined game ${game_id}`;

    return result;
}

gameUnoLogic.joinGameIfPossible = joinGameIfPossible;

/*
Return format
{
    status,
    message,
    game,
    player,
{
 */
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
async function leaveGame(user_id, game_id) {
    debugPrinter.printFunction(leaveGame.name);

    const result = {
        status_game_uno: null,
        message: null,
        game: null,
        player: null,
        change_turn: null,
    };

    // Get game (May be undefined)
    const gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    if (!gameRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }
    result.game = gameRowDetailed;

    // May be undefined
    const playerRowDetailed = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(user_id, game_id);

    // If playerRowDetailed does not exist
    if (!playerRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Player does not exist for game ${game_id}`;
        return result;
    }
    result.player = playerRowDetailed;

    // If the player is the host
    if (playerRowDetailed.player_id === gameRowDetailed.player_id_host) {
        // May be empty
        result.game = await dbEngineGameUno.deleteGameRow(game_id); // Will also delete players in game
        result.message = `Game ${game_id} is removed and player ${playerRowDetailed.display_name} (player_id ${playerRowDetailed.player_id}) is removed`;
    } else {
        /*
        If the player has the turn

        IMPORTANT NOTES:
             WARNING, MUST CHANGE TURN BEFORE LEAVING OR ELSE THE GAME WILL CRASH

         */
        if (gameRowDetailed.player_id_turn === playerRowDetailed.player_id) {
            // IMPORTANT NOTE: No emit of the gameState needs to happen here because it's handled in the intermediate_game_uno
            const changeTurn = await gameUnoLogicHelper.changeTurnByGameRow(gameRowDetailed);

            if (changeTurn.status_game_uno === constants.FAILURE) {
                result.status_game_uno = changeTurn.status_game_uno;
                result.message = changeTurn.message;
                // return result; // Do not return here because there is more stuff that needs to be returned
            }

            result.change_turn = changeTurn;
        }

        // May be empty
        result.player = await dbEngineGameUno.deletePlayerRowByPlayerID(playerRowDetailed.player_id);
        result.message = `Player ${playerRowDetailed.display_name} (player_id ${playerRowDetailed.player_id}) is removed from game ${game_id}`;
    }

    result.status_game_uno = constants.SUCCESS;

    return result;
}

gameUnoLogic.leaveGame = leaveGame;

// TODO: DON'T USE THE BELOW, IT IS THE OLD STYLE OF CREATING A GAME
//
// /**
//  * Given an array, shuffle it
//  *
//  * @param array
//  * @returns {Promise<*>}
//  */
// async function shuffleArray(array) {
//     let itemTemp;
//
//     // eslint-disable-next-line no-plusplus
//     for (let i = array.length - 1; i > 0; i--) {
//         const indexRandom = Math.floor(Math.random() * (i + 1));
//
//         itemTemp = array[i];
//
//         // Swap items at index location
//         // eslint-disable-next-line no-param-reassign
//         array[i] = array[indexRandom];
//         // eslint-disable-next-line no-param-reassign
//         array[indexRandom] = itemTemp;
//     }
//     return array;
// }
//
// /**
//  * Generate the initial cards for a game
//  *
//  * Notes:
//  *      Create Player Row
//  *      Create Game Row
//  *
//  *      Create Players Row (Link Player Row to Game Row. The first player should be the host)
//  *
//  *      Create Card Rows
//  *          Create Card Rows based on Card.card_id and CardInfo.card_info_id
//  *          Create Cards Rows based on Card.card_id and Game.game_id
//  *          Create Collection Rows based on Card.card_id and CollectionInfo.collection_info_id
//  *
//  * @param game_id
//  * @returns {Promise<void>}
//  */
// async function createGame(user_id) {
//     debugPrinter.printFunction(createGame.name);
//     debugPrinter.printDebug(user_id);
//
//     // FIXME: WARNING: DANGEROUS AND NOT ACID PROOF
//
//     const playerRow = await dbEngineGameUno.createPlayerRow(user_id);
//     debugPrinter.printDebug(playerRow);
//
//     const gameRow = await dbEngineGameUno.createGameRow(playerRow.player_id);
//     debugPrinter.printDebug(gameRow);
//
//     const playersRow = await dbEngineGameUno.createPlayersRow(gameRow.game_id, playerRow.player_id);
//     debugPrinter.printDebug(playersRow);
//
//     const cardRows = await dbEngineGameUno.createCardRowsAndCardsRows(gameRow.game_id, 2);
//     debugPrinter.printDebug(cardRows);
//
//     // TODO: ADDING TO THE Collection IS NOT WRITTEN, WRITE THE ALGO TO SHUFFLE THE CARDS IN THE DECk
//     // dbEngineGameUno.createCollectionRow(card_id, collection_info_id, collection_index);
//
//     const cardRowsShuffled = await shuffleArray(cardRows);
//     const collection = await Promise.all(cardRowsShuffled.map((element, index) => dbEngineGameUno.createCollectionRow(cardRowsShuffled[index].card_id, 1, index)));
//
//     return {
//         player: playerRow,
//         game: gameRow,
//         players: playersRow,
//         cardRows,
//         collection,
//     };
// }

// gameUnoLogic.createGame = createGame;

/*
Return Format
{
    status,
    message,
    player,
    game,
    players,
}
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
 * @param user_id
 */
async function createGameV2(user_id) {
    debugPrinter.printFunction(createGameV2.name);

    const result = {
        status_game_uno: null,
        message: null,
        player: null,
        game: null,
        game_data: null,
        players: null,
    };

    // FIXME: WARNING: DANGEROUS, NOT ACID PROOF

    // Get player (May be undefined)
    const playerRowDetailed = await dbEngineGameUno.createPlayerRow(user_id);
    // debugPrinter.printDebug(playerRowDetailed);

    if (!playerRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = 'Could not create player row when creating game';
        return result;
    }
    result.game = playerRowDetailed;

    // Get game (May be undefined)
    const gameRowDetailed = await dbEngineGameUno.createGameRow(playerRowDetailed.player_id);
    // debugPrinter.printDebug(gameRowDetailed);

    if (!gameRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = 'Could not create game row when creating game';
        return result;
    }
    result.game = gameRowDetailed;

    const gameDataRow = await dbEngineGameUno.createGameDataRow(gameRowDetailed.game_id);

    if (!gameDataRow) {
        result.status_game_uno = constants.FAILURE;
        result.message = 'Could not create game row when creating game';
        return result;
    }
    result.game_data = gameDataRow;

    // Create players row (May be undefined)
    const playersRow = await dbEngineGameUno.createPlayersRow(gameRowDetailed.game_id, playerRowDetailed.player_id);
    // debugPrinter.printDebug(playersRow);

    if (!playersRow) {
        result.status_game_uno = constants.FAILURE;
        result.message = 'Could not create players row when creating game, game will be deleted';

        await dbEngineGameUno.deleteGameRow(gameRowDetailed); // For safety, remove the game

        return result;
    }

    result.players = playersRow;

    result.status_game_uno = constants.SUCCESS;
    result.message = `Game ${gameRowDetailed.game_id}, player ${playersRow.player_id}, game's players were created`;

    return result;
}

gameUnoLogic.createGameV2 = createGameV2;

/**
 * Notes:
 * @param gameRow
 * @returns {Promise<{game_data: null, status_game_uno: null, message: null}>}
 */
async function reshuffleCollectionPlayBackToDrawAndMoveCardDrawToPlayIfCardPlayIsInvalid(gameRow) {
    debugPrinter.printFunction(reshuffleCollectionPlayBackToDrawAndMoveCardDrawToPlayIfCardPlayIsInvalid.name);

    const result = {
        status_game_uno: null,
        message: null,
        game_data: null,
    };

    let drawCount = null;

    let gameDataResult = null;

    // FIXME: VERY DANGEROUS LOOP
    while (!gameDataResult || gameDataResult.status_game_uno === constants.FAILURE) {
        // eslint-disable-next-line no-await-in-loop
        gameDataResult = await gameUnoLogicHelper.updateGameDataFull(gameRow.game_id, null);

        // eslint-disable-next-line no-await-in-loop
        drawCount = await dbEngineGameUno.getCollectionCountByGameIDAndCollectionInfoID(gameRow.game_id, 1);

        if (gameDataResult.status_game_uno === constants.FAILURE || !drawCount) {
            // eslint-disable-next-line no-await-in-loop
            await dbEngineGameUno.updateCollectionRowsPlayToDrawAndRandomizeDrawByGameID(gameRow.game_id);
            // eslint-disable-next-line no-await-in-loop
            await gameUnoLogic.moveCardDrawToPlay(gameRow.game_id);
        }

        // If drawCount is still zero
        if (!drawCount) {
            result.status_game_uno = constants.FAILURE;
            result.message = `Failed to reshuffle Collection PLAY into Collection DRAW of game_id ${gameRow.game_id}`;
            return result;
        }
    }

    result.game_data = gameDataResult;

    result.status_game_uno = constants.SUCCESS;
    result.message = `GameData (game_id ${gameRow.game_id}) was updated`;

    return result;
}

gameUnoLogic.reshuffleCollectionPlayBackToDrawAndMoveCardDrawToPlayIfCardPlayIsInvalid = reshuffleCollectionPlayBackToDrawAndMoveCardDrawToPlayIfCardPlayIsInvalid;

/*
{
    status,
    message,
    game,
    cards,
}
 */
/**
 * Start the game
 *
 * IMPORTANT NOTES:
 *      DO NOT RETURN THE RESULT OF THIS FUNCTION TO USERS BECAUSE IT RETURNS EVERYTHING ABOUT THE CARDS
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
 *
 * @param user_id
 * @param deckMultiplier
 * @param drawAmountPerPlayer
 * @param callback_game_id
 * @returns {Promise<null|{game: null, message: null, status: null}>}
 */
async function startGame(user_id, game_id, deckMultiplier, drawAmountPerPlayer, callback_game_id) {
    debugPrinter.printFunction(startGame.name);

    // TODO: Assign player_index to players so you know the turn order. Maybe do this because we can use the player_id instead

    const result = {
        status_game_uno: null,
        message: null,
        game: null,
        player: null,
        cards: null,
        players: null,
        change_turn: null,
    };

    let gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    if (!gameRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    result.game = gameRowDetailed;

    // Get player given game_id and user_id (May be undefined)
    const playerRowDetailedHost = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(user_id, game_id);

    // If player is exists for the user for the game
    if (!playerRowDetailedHost) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Player does not exist for game ${game_id}`;
        return result;
    }
    result.player = playerRowDetailedHost;

    // If player_id is host and if game is not active, make it active
    if (gameRowDetailed.is_active === true) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${game_id} is already active`;
        return result;
    }

    await dbEngineGameUno.updateGameRowIsActiveByGameID(game_id, true);

    // May be empty
    const cardRows = await dbEngineGameUno.createCardRowsAndCardsRowsAndCollectionRowsWithCollectionRandomized(gameRowDetailed.game_id, deckMultiplier);
    // debugPrinter.printDebug(cardRows);

    // Basically if cards not created
    if (!cardRows.length) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Cards could not be made for game ${game_id}, game ${game_id} will be deleted`;

        await dbEngineGameUno.deleteGameRow(gameRowDetailed); // For safety, remove the game

        return result;
    }

    result.cards = cardRows; // In this case, cardsRows is not cards, but cardRows is cards

    // May be empty
    await dbEngineGameUno.updatePlayersRowsInGameRows(game_id, true);

    const playerRowsDetailed = await dbEngineGameUno.getPlayerRowsDetailedByGameID(gameRowDetailed.game_id);

    if (!playerRowsDetailed.length) {
        result.status_game_uno = constants.FAILURE;
        // result.message = `Error no players for game ${game_id}, game ${game_id} will be deleted`;
        result.message = `Error no players for game ${game_id}`;

        // await dbEngineGameUno.deleteGameRow(gameRowDetailed); // For safety, remove the game (DON'T DELETE GAME, COMMENT THIS OUT TO SUPPORT OPEN LOBBIES)

        return result;
    }
    result.players = playerRowsDetailed;

    // New Game Row
    gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);
    result.game = gameRowDetailed;

    /* ----- Distribute Cards ----- */

    // eslint-disable-next-line no-restricted-syntax
    for (const playerRowDetailed of playerRowsDetailed) {
        // eslint-disable-next-line no-use-before-define,no-await-in-loop
        await moveCardDrawTopToHandHelper(gameRowDetailed, playerRowDetailed, drawAmountPerPlayer, callback_game_id);
    }

    // TODO GUARD AND CHECK
    await gameUnoLogic.moveCardDrawToPlay(game_id);

    // TODO GUARD AND CHECK
    await reshuffleCollectionPlayBackToDrawAndMoveCardDrawToPlayIfCardPlayIsInvalid(gameRowDetailed);

    const changeTurn = await gameUnoLogicHelper.changeTurnByGameID(gameRowDetailed.game_id);

    if (changeTurn.status_game_uno === constants.FAILURE) {
        result.status_game_uno = changeTurn.status;
        result.message = changeTurn.message;
        return result;
    }

    result.change_turn = changeTurn;

    result.status_game_uno = constants.SUCCESS;
    result.message = `Game ${game_id} started`;

    return result;
}

gameUnoLogic.startGame = startGame;

/*
game_state

Notes:
    This should not show any information about the actual cards, but only for the

{
    status,
    message,
    game:
        {
            card_color_legal,
            card_content_legal,
            card_type_legal,
            draw_amount,
            game_id,
            is_active,
            is_clockwise,
            player_id_host,
            player_id_turn,
            skip_amount,
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
                player_id: null,
                type,
                content,
                color,
                card_id,
                card_info_id,
                collection_index,
                collection_info_id,
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
    debugPrinter.printFunction(getGameState.name);

    const result = {
        status_game_uno: null,
        message: null,
        game: null,
        players: null,
        collection_draw: null,
        collection_play: null,
    };

    // May be undefined
    const gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // If Game Row does not exist
    if (!gameRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    result.game = gameRowDetailed;

    // May be empty
    const playerRowsDetailed = await dbEngineGameUno.getPlayerRowsDetailedByGameID(gameRowDetailed.game_id);

    result.players = playerRowsDetailed;

    // eslint-disable-next-line no-restricted-syntax
    for (const playerRow of playerRowsDetailed) {
        // eslint-disable-next-line no-await-in-loop
        playerRow.collection = await dbEngineGameUno.getCollectionRowsCollectionIndexByPlayerID(playerRow.player_id);
    }

    // May be empty
    result.collection_draw = await dbEngineGameUno.getCollectionRowsCollectionIndexByGameIDAndCollectionInfoID(game_id, 1);

    // May be empty
    result.collection_play = await dbEngineGameUno.getCollectionRowsDetailedByGameIDAndCollectionInfoID(game_id, 2);

    result.status_game_uno = constants.SUCCESS;
    result.message = 'Game state returned';

    // Game state
    return result;
}

gameUnoLogic.getGameState = getGameState;

async function moveCardDrawTopToHandHelper(gameRowDetailed, playerRowDetailed, draw_amount, callback_game_id, callback_game_id_message) {
    debugPrinter.printFunction(moveCardDrawTopToHandHelper.name);
    let collectionRowHand = null;

    let cardsDrew = 0;

    // Draw the appropriate amount of cards for the player
    while (cardsDrew < draw_amount) {
        // If the server crashes, the player still needs to draw the appropriate amount of cards (May be undefined)
        // eslint-disable-next-line no-await-in-loop
        const gameDataRow = await dbEngineGameUno.updateGameDataRowDrawAmount(gameRowDetailed.game_id, draw_amount - cardsDrew);

        if (!gameDataRow) {
            // result.status_game_uno = constants.FAILURE;
            // result.message = `Game ${gameRowDetailed.game_id}'s GameData failed to update draw_amount`;
            // return result;

            debugPrinter.printError(`Error when Drawing cards for Game game_id ${gameRowDetailed.game_id}`);
            /*
            If this break is hit, then something went wrong updating the db. This break should probably never be hit, but
            if it does then something went wrong

             */
            break;
        }

        // eslint-disable-next-line no-await-in-loop
        const collectionCountDraw = await dbEngineGameUno.getCollectionCountByGameIDAndCollectionInfoID(gameRowDetailed.game_id, 1);
        // debugPrinter.printRed('collectionCountDraw === 0');
        // debugPrinter.printRed(typeof collectionCountDraw);
        // debugPrinter.printRed(collectionCountDraw);
        // debugPrinter.printGreen(collectionCountDraw);

        // If there are no cards in the Collection DRAW, reshuffle Collection PLAY to Collection DRAW
        if (collectionCountDraw === 0) {
            // eslint-disable-next-line no-await-in-loop
            const gameDataRowNew = await reshuffleCollectionPlayBackToDrawAndMoveCardDrawToPlayIfCardPlayIsInvalid(gameRowDetailed);

            if (gameDataRowNew.status_game_uno === constants.FAILURE) {
                // result.status_game_uno = constants.FAILURE;
                // result.message = `Collection DRAW is still empty, ${playerRow.player_id} Should play cards`;
                // return result;

                /*
                If this break is hit, the game is in a complicated state where there no cards in the DRAW collection even after
                moving all the cards from the PLAY collection into the DRAW collection and playing 1 card from the DRAW to the PLAY.

                If the player can't play a card after all this drawing, the game will probably be in a soft lock state...

                TODO: Add code to prevent this soft lock by skipping the player if they can't play a legal card

                 */

                const changeTurn = await gameUnoLogicHelper.changeTurnByGameID(gameRowDetailed.game_id);

                // TODO GUARD
                // if (changeTurn.status_game_uno === constants.FAILURE) {
                //     result.status_game_uno = changeTurn.status;
                //     result.message = changeTurn.message;
                //     return result;
                // }

                // Execute the callback if necessary
                if (callback_game_id) {
                    // eslint-disable-next-line no-await-in-loop
                    await callback_game_id(gameRowDetailed.game_id);
                }

                if (callback_game_id_message) {
                    // eslint-disable-next-line no-await-in-loop
                    await callback_game_id_message(gameRowDetailed.game_id, 'The DRAW Collection ran out of cards, the game will resort to changing turnings until the '
                        + 'DRAW Collection has sufficient cards to continue the game normally.');
                }

                break;
            }

            // Execute the callback if necessary
            if (callback_game_id) {
                // eslint-disable-next-line no-await-in-loop
                await callback_game_id(gameRowDetailed.game_id);
            }
        }

        // My be undefined
        // eslint-disable-next-line no-await-in-loop
        collectionRowHand = await dbEngineGameUno.updateCollectionRowDrawToHandTop(gameRowDetailed.game_id, playerRowDetailed.player_id); // TODO YOU YA

        // TODO GUARD
        // if (!collectionRowHand) {
        //     result.status_game_uno = constants.FAILURE;
        //     result.message = `Error in updating player ${playerRowDetailed.display_name} (player_id ${playerRowDetailed.player_id})'s collection`;
        //     return result;
        // }

        // Execute the callback if necessary
        if (callback_game_id) {
            // eslint-disable-next-line no-await-in-loop
            await callback_game_id(gameRowDetailed.game_id);
        }

        cardsDrew += 1;
    }

    const arrayPromises = [];

    // IGNORE THIS: FIXME DO NOT DO THIS HERE DO THIS IS updateGameData
    const collectionCountHand = await dbEngineGameUno.getCollectionCountByPlayerID(playerRowDetailed.player_id);
    if (collectionCountHand === 1) {
        arrayPromises.push(dbEngineGameUno.updatePlayerRowIsUnoCheckedByGameIdAndPlayerId(gameRowDetailed.game_id, playerRowDetailed.player_id, true));
        arrayPromises.push(dbEngineGameUno.updateGameDataRowIsUnoAvailable(gameRowDetailed.game_id, true));
    } else {
        arrayPromises.push(dbEngineGameUno.updatePlayerRowIsUnoCheckedByGameIdAndPlayerId(gameRowDetailed.game_id, playerRowDetailed.player_id, false));
    }

    await Promise.all(arrayPromises);

    return collectionRowHand;
}

async function moveCardDrawTopToHandFullByGameIDAndPlayerRow(game_id, playerRowDetailed, callback_game_id, callback_game_id_message) {
    debugPrinter.printFunction(moveCardDrawTopToHandFullByGameIDAndPlayerRow.name);

    const result = {
        status_game_uno: null,
        message: null,
        game: null,
        player: null,
        collection: null,
        // change_turn: null, // May or may not exist
    };

    // May be undefined
    const gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // If Game Row does not exist
    if (!gameRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    result.game = gameRowDetailed;

    // If player is exists for the user for the game
    if (!playerRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Player does not exist for game ${game_id}`; // Short circuit because the playerRow is based on the game_id (don't need to check if game exists)
        return result;
    }
    result.player = playerRowDetailed;

    // TODO THE MAIN BODY IS BELOW THIS

    debugPrinter.printError({
        gameRowDetailed,
        playerRowDetailed,
        callback_game_id,
    });
    const collectionRowHand = await moveCardDrawTopToHandHelper(
        gameRowDetailed,
        playerRowDetailed,
        gameRowDetailed.draw_amount,
        callback_game_id,
        callback_game_id_message,
    );

    const arrayPromise = [];

    // Reset draw amount
    arrayPromise.push(dbEngineGameUno.updateGameDataRowDrawAmount(game_id, 1));

    // Reset Challenge if there was a challenge
    arrayPromise.push(dbEngineGameUno.updateGameDataRowIsChallengeAvailable(gameRowDetailed.game_id, false));

    await Promise.all(arrayPromise);

    // TODO THE BELOW IS DRAWING WHEN WILD +4 or +2 iS ON TOP

    // Change turn if player draws when there is a WILDFOUR or DRAWTWO and the draw_amount is > 0 (Note that gameRowDetailed should be outdated by this point which is why this logic works)
    if (((gameRowDetailed.card_content_legal === constantsGameUno.CARD_CONTENT_WILDFOUR) || (gameRowDetailed.card_content_legal === constantsGameUno.CARD_CONTENT_DRAWTWO))
        && (gameRowDetailed.draw_amount > 1)) {
        const changeTurn = await gameUnoLogicHelper.changeTurnByGameID(gameRowDetailed.game_id);

        if (changeTurn.status_game_uno === constants.FAILURE) {
            result.status_game_uno = changeTurn.status;
            result.message = changeTurn.message;
            return result;
        }

        result.change_turn = changeTurn;

        // Execute the callback if necessary
        if (callback_game_id) {
            // eslint-disable-next-line no-await-in-loop
            await callback_game_id(gameRowDetailed.game_id);
        }
    }

    result.collection = collectionRowHand;

    // debugPrinter.printError("JOSEPH LOOK 1")
    // debugPrinter.printDebug(gameRowDetailed)

    // FIXME: DO NOT CALL THIS WHAT SO EVER
    // await gameUnoLogicHelper.updateGameDataFull(gameRowDetailed.game_id, null); // DO NOT CALL THIS

    result.status_game_uno = constants.SUCCESS;
    result.message = `A card from DRAW's collection moved to player ${playerRowDetailed.display_name} (player_id ${playerRowDetailed.player_id})'s collection's top for Game ${game_id}`;

    return result;
}

gameUnoLogic.moveCardDrawTopToHandFullByGameIDAndPlayerRow = moveCardDrawTopToHandFullByGameIDAndPlayerRow;

/*
{
    status,
    message,
    player,
    collection,
}
 */
async function moveCardDrawTopToHandFull(user_id, game_id, callback_user_id) {
    debugPrinter.printFunction(moveCardDrawTopToHandFull.name);

    // Get player given game_id and user_id (May be undefined)
    const playerRow = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(user_id, game_id);

    return moveCardDrawTopToHandFullByGameIDAndPlayerRow(game_id, playerRow, callback_user_id);
}

gameUnoLogic.moveCardDrawTopToHandFull = moveCardDrawTopToHandFull;

async function moveCardDrawToPlay(game_id) { // TODO ADD MORE GUARDING AND ERROR CHECKING ETC
    debugPrinter.printFunction(moveCardDrawToPlay.name);

    const result = {
        status_game_uno: null,
        message: null,
        game: null,
        collection: null,
    };

    // May be undefined
    const gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // If Game Row does not exist
    if (!gameRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    const collectionRow = await dbEngineGameUno.updateCollectionRowDrawToPlayTop(game_id);

    if (!collectionRow) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Error when updating PLAY's collection for Game ${game_id}`; // TODO FIX THEN
        return result;
    }
    result.collection = collectionRow;

    result.status_game_uno = constants.SUCCESS;
    result.message = `A card from DRAW's collection moved to PLAY's collection's top for Game ${game_id}`; // TODO FIX THEN

    return result;
}

gameUnoLogic.moveCardDrawToPlay = moveCardDrawToPlay;

/**
 * Play card
 *
 * @param game_id
 * @param user_id
 * @param collection_index
 * @param color
 * @returns {Promise<{player_current_turn_new: null, game: null, collection: null, message: null, status: null, player: null}>}
 */
async function moveCardHandToPlayByCollectionIndex(user_id, game_id, collection_index, color) {
    debugPrinter.printFunction(moveCardHandToPlayByCollectionIndex.name);

    const result = {
        status_game_uno: null,
        message: null,
        player: null,
        game: null,
        game_logic: null,
    };

    // May be undefined
    const gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // If Game Row does not exist
    if (!gameRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    // Get player given game_id and user_id (May be undefined)
    const playerRowDetailed = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(user_id, game_id);

    // If player is exists for the user for the game
    if (!playerRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Player ${playerRowDetailed.display_name} (player_id ${playerRowDetailed.player_id}) does not exist for game ${game_id}`;
        // Can be used as a short circuit because the playerRowDetailed is based on the game_id (don't need to check if game exists)
        return result;
    }
    result.player = playerRowDetailed;

    // Check if it's the player's turn
    if (gameRowDetailed.player_id_turn !== playerRowDetailed.player_id) {
        result.status_game_uno = constants.FAILURE;
        result.message = `It is not Player ${playerRowDetailed.display_name} (player_id ${playerRowDetailed.player_id}) turn for game ${game_id}`;
        return result;
    }

    // TODO STUFF BELOW
    const gameLogic = await gameUnoLogicHelper.doMoveCardHandToPlayByCollectionIndexLogic(gameRowDetailed, playerRowDetailed, collection_index, color);

    if (gameLogic.status_game_uno === constants.FAILURE) {
        result.status_game_uno = gameLogic.status_game_uno;
        result.message = gameLogic.message;
        return result;
    }

    result.game_logic = gameLogic;

    result.status_game_uno = constants.SUCCESS;

    result.message = `Card (collection_index ${collection_index}) from player ${playerRowDetailed.display_name} `
        + `(player_id ${playerRowDetailed.player_id})'s collection moved to PLAY's collection's top for Game ${game_id}`;

    return result;
}

gameUnoLogic.moveCardHandToPlayByCollectionIndex = moveCardHandToPlayByCollectionIndex;

async function getHand(user_id, game_id) {
    debugPrinter.printFunction(getHand.name);

    const result = {
        status_game_uno: null,
        message: null,
        player: null,
        collection: null,
    };

    const gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // Check if game exists
    if (!gameRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    result.game = gameRowDetailed;

    // Get player given game_id and user_id (May be undefined)
    const playerRowDetailed = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(user_id, game_id);

    // If player is exists for the user for the game
    if (!playerRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Player does not exist for game ${game_id}`; // Short circuit because the playerRowDetailed is based on the game_id (don't need to check if game exists)
        return result;
    }
    result.player = playerRowDetailed;

    // May be empty
    const collectionRows = await dbEngineGameUno.getCollectionRowsDetailedByPlayerID(playerRowDetailed.player_id);

    // // If player is exists for the user for the game
    // if (!collectionRows.length) {
    //     result.status_game_uno = constants.FAILURE;
    //     result.message = `Collection is empty for player ${playerRowDetailed.display_name} (player_id ${playerRowDetailed.player_id})`;
    //     return result;
    // }

    result.status_game_uno = constants.SUCCESS;
    result.message = `Player ${playerRowDetailed.display_name} (player_id ${playerRowDetailed.player_id})'s hand returned`;

    result.collection = collectionRows;

    return result;
}

gameUnoLogic.getHand = getHand;

async function getPlayerDetailedByGameIDAndUserID(user_id, game_id) {
    debugPrinter.printFunction(getPlayerDetailedByGameIDAndUserID.name);

    const result = {
        status_game_uno: null,
        message: null,
        game: null,
        player: null,
    };

    const gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);
    // Check if game exists
    if (!gameRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    result.game = gameRowDetailed;

    // Get player given game_id and user_id (May be undefined)
    const playerRowDetailed = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(user_id, game_id);

    // If player is exists for the user for the game
    if (!playerRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Player does not exist for game ${game_id}`; // Short circuit because the playerRowDetailed is based on the game_id (don't need to check if game exists)
        return result;
    }
    result.player = playerRowDetailed;

    result.status_game_uno = constants.SUCCESS;
    result.message = `Player ${playerRowDetailed.display_name} (player_id ${playerRowDetailed.player_id}) returned`;

    return result;
}

gameUnoLogic.getPlayerDetailedByGameIDAndUserID = getPlayerDetailedByGameIDAndUserID;

async function setGamePlayerIDHost(user_id, game_id) {
    debugPrinter.printFunction(setGamePlayerIDHost.name);

    const result = {
        status_game_uno: null,
        message: null,
        game: null,
        player: null,
    };

    const gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // Check if game exists
    if (!gameRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }
    result.game = gameRowDetailed;

    // Get player given game_id and user_id (May be undefined)
    const playerRowDetailed = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(user_id, game_id);

    // If player is exists for the user for the game
    if (!playerRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Player does not exist for game ${game_id}`;

        return result;
    }
    result.player = playerRowDetailed;

    const gameRowNew = await dbEngineGameUno.updateGameRowPlayerIDHostByGameID(game_id, playerRowDetailed.player_id);

    if (!gameRowNew) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Could not update game ${game_id}'s player turn`;
        return result;
    }
    result.game = gameRowNew;

    result.status_game_uno = constants.SUCCESS;
    result.message = `Player ${playerRowDetailed.display_name} (player_id ${playerRowDetailed.player_id}) is not the host of game ${game_id}`;

    return result;
}

gameUnoLogic.setGamePlayerIDHost = setGamePlayerIDHost;

async function challengePlayerHandler(gameRowDetailed, playerRowChallenger, playerRowChallenged, collectionRowsChallenged, callback_game_id) {
    debugPrinter.printFunction(challengePlayerHandler.name);

    const result = {
        status_game_uno: null,
        message: null,
        boolean: null,
    };

    const isWildFourLegal = await gameUnoLogicHelper.isWildFourPlayLegal(gameRowDetailed, collectionRowsChallenged);

    result.boolean = isWildFourLegal;

    // If Wild +4 is legal
    if (isWildFourLegal) {
        debugPrinter.printDebug('CHALLENGER LOSS');

        // TODO GUARD
        const collectionRowHand = await moveCardDrawTopToHandHelper(gameRowDetailed, playerRowChallenger, 2, callback_game_id);

        result.message = `Player ${playerRowChallenger.display_name} (player_id ${playerRowChallenger.player_id})'s `
            + `challenge against Player ${playerRowChallenged.display_name} (player_id ${playerRowChallenged.player_id}) failed`;
    } else {
        // TODO GUARD
        const collectionRowHand = await moveCardDrawTopToHandHelper(gameRowDetailed, playerRowChallenged, 6, callback_game_id);
        debugPrinter.printDebug('CHALLENGER WIN');

        // Put the top card back in the original player's hand (Wild +4 back to original player's hand)
        // const collectionRow = await dbEngineGameUno.updateCollectionRowPlayToHandTop(gameRowDetailed.game_id, playerRowChallenged.player_id);
        //
        // // Execute the callback if necessary
        // if (callback_game_id) {
        //     // eslint-disable-next-line no-await-in-loop
        //     await callback_game_id(gameRowDetailed.game_id);
        // }

        result.message = `Player ${playerRowChallenger.display_name} (player_id ${playerRowChallenger.player_id})'s `
            + `challenge against Player ${playerRowChallenged.display_name} (player_id ${playerRowChallenged.player_id}) was successful`;
    }

    // Reset the draw amount
    await dbEngineGameUno.updateGameDataRowDrawAmount(gameRowDetailed.game_id, 1);

    result.status_game_uno = constants.SUCCESS;

    return result;
}

async function challengePlayer(game_id, playerRow, callback_game_id) {
    debugPrinter.printFunction(challengePlayer.name);

    const result = {
        status_game_uno: null,
        message: null,
        game: null,
        collection: null,
    };

    const gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // Check if game exists
    if (!gameRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }
    result.game = gameRowDetailed;

    if (!(await gameUnoLogicHelper.canPlayerChallenge(gameRowDetailed, playerRow))) {
        result.status_game_uno = constants.FAILURE;
        result.message = `game_id ${game_id}, Player ${playerRow.display_name}, player_id ${playerRow.player_id} cannot challenge`;
        return result;
    }

    const resultPlayerPreviousObject = await gameUnoLogicHelper.getUserIDAndPlayerIDPreviousByGameRow(gameRowDetailed);

    if (resultPlayerPreviousObject.status_game_uno === constants.FAILURE) {
        result.status_game_uno = resultPlayerPreviousObject.status_game_uno;
        result.message = resultPlayerPreviousObject.message;
        return result;
    }

    const { user_id_previous } = resultPlayerPreviousObject;

    const resultHandObject = await getHand(user_id_previous, game_id);

    if (resultHandObject.status_game_uno === constants.FAILURE) {
        result.status_game_uno = resultHandObject.status_game_uno;
        result.message = resultHandObject.message;
        return result;
    }
    result.collection = resultHandObject.collection;

    // TODO CHALLENGE IS RIGHT HERE

    // TODO GUARD
    const resultChallengePlayerHandlerObject = await challengePlayerHandler(
        gameRowDetailed,
        playerRow,
        resultHandObject.player,
        resultHandObject.collection,
        callback_game_id,
    );

    // Update gameData
    // await gameUnoLogicHelper.updateGameDataByGameRow(gameRowDetailed, null);
    // await gameUnoLogicHelper.updateGameDataFull(gameRowDetailed.game_id, null); // TODO DO NOT CALL THIS HERE

    // Reset Challenge
    await dbEngineGameUno.updateGameDataRowIsChallengeAvailable(gameRowDetailed.game_id, false);

    result.status_game_uno = resultChallengePlayerHandlerObject.status_game_uno;
    result.message = resultChallengePlayerHandlerObject.message;

    return result;
}

gameUnoLogic.challengePlayer = challengePlayer;

async function callUnoLogic(user_id, game_id, callback_game_id, callback_game_id_message) {
    const result = {
        status_game_uno: null,
        message: null,
    };

    // Get Game
    const gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);
    if (!gameRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Could not retrieve the details for game_id: ${game_id}`;
        return result;
    }

    // Check if can call UNO
    if (gameRowDetailed.is_uno_available === false) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Cannot call UNO at this time for game_id: ${game_id}`;
        return result;
    }

    // Get player given game_id and user_id (May be undefined)
    const playerRowDetailedCaller = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(user_id, game_id);

    // If player is exists for the user for the game
    if (!playerRowDetailedCaller) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Player does not exist for game ${game_id}`;

        return result;
    }

    // Get players in the game (TODO CHANGE IT TO ACTIVE PLAYERS)
    const playerRowsInGame = await dbEngineGameUno.getPlayerRowsDetailedByGameID(game_id);
    if (!playerRowsInGame) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Could not retrieve the list of players in game_id: ${game_id}`;
        return result;
    }

    // TODO CAN OPTIMIZE AWAIT
    for (const playerRowDetailed of playerRowsInGame) {
        // Draw for player who have one card except for the caller of this function
        if (playerRowDetailed.uno_check === true && playerRowDetailedCaller.player_id !== playerRowDetailed.player_id) {
            // eslint-disable-next-line no-await-in-loop
            await moveCardDrawTopToHandHelper(
                gameRowDetailed,
                playerRowDetailed,
                2,
                callback_game_id,
                callback_game_id_message,
            );
        }
        // eslint-disable-next-line no-await-in-loop
        await dbEngineGameUno.updatePlayerRowIsUnoCheckedByGameIdAndPlayerId(game_id, playerRowDetailed.player_id, false);
    }
    await dbEngineGameUno.updateGameDataRowIsUnoAvailable(gameRowDetailed.game_id, false);

    // // Finding players who are marked with unoChecked = true; // FIXME: THIS IS NOT ACTIVE PLAYERS, CHANGE IT TO ACTIVE PLAYERS WHEN THE CODE SUPPORTS IT
    // for (let i = 0; i < playerRowsInGame.length; i++) {
    //     // eslint-disable-next-line no-await-in-loop
    //     const currentPlayerHand = await dbEngineGameUno.getCollectionRowsDetailedByPlayerID(playerRowsInGame[i].player_id);
    //     if (!currentPlayerHand) {
    //         result.status_game_uno = constants.FAILURE;
    //         result.message = `Could not retrieve the hand for the current player_id ${playerRowsInGame[i].player_id} in game ${game_id}`;
    //         return result;
    //     }
    //     if (playerRowsInGame[i].uno_check === false && currentPlayerHand.length === 1) {
    //         // eslint-disable-next-line no-await-in-loop
    //         await moveCardDrawTopToHandHelper(gameRowDetailed, playerRowsInGame[i], 2, callback_game_id, callback_game_id_message);
    //     }
    // }

    // Update gameData
    // await gameUnoLogicHelper.updateGameDataByGameRow(gameRowDetailed, null); // TODO DO NOT CALL THIS HERE
    await gameUnoLogicHelper.updateGameDataFull(gameRowDetailed.game_id, null);

    result.status_game_uno = constants.SUCCESS;
    result.message = `uno_check successfully flagged for player_id: ${playerRowDetailedCaller.player_id} in game ${game_id}`;

    return result;
}

gameUnoLogic.callUnoLogic = callUnoLogic;

module.exports = gameUnoLogic;

// TODO REASSIGN player_index WHEN A PLAYER IS OUT. BASCIALLY WHEN THEY CALLED UNO AND THEY ARE NOT A PLAYER IN THE ACTUAL PLAYING OF THE GAME
// TODO SET CURRENT TURN PLAYER ID
// TODO SET CLOCKWISE
// TODO CHANGE HOST
// TODO some route about calling Uno

/// //////////
// TODO Automatic Change Host when main host leaves
// TODO ON Start game ASSIGN PLAYER INDEX
// TODO Automatically change player turn
