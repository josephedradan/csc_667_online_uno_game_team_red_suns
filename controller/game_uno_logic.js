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

/*
Return format
{
    status,
    message,
    games,
{
 */
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
    const playerRows = await Promise.all(gameRowsSimple.map((gameRow) => dbEngineGameUno.getPlayerRowsDetailedByGameID(gameRow.game_id)));

    const gamesWithPlayersRows = gameRowsSimple.map((row, index) => ({
        game: row,
        players: playerRows[index],
    }));

    result.status = constants.SUCCESS;
    result.message = 'Games with their players returned';
    result.games = gamesWithPlayersRows;

    return result;
}

gameUnoLogic.getGamesWithTheirPlayersSimple = getGamesWithTheirPlayersSimple;

/*
Return format
{
    status,
    message,
    games,
    players,
{
 */
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
    const gameRow = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // If Game Row does not exist
    if (!gameRow) {
        result.status = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    result.game = gameRow;

    // May be empty
    const playerRows = await dbEngineGameUno.getPlayerRowsDetailedByGameID(gameRow.game_id);

    if (!playerRows.length) {
        result.status = constants.FAILURE;
        result.message = `Error no players for game ${game_id}`;
        return result;
    }
    result.players = playerRows;

    result.status = constants.SUCCESS;
    result.message = `Game ${game_id} and its players returned`;

    return result;
}

gameUnoLogic.getGameAndTheirPlayersByGameIDDetailed = getGameAndTheirPlayersByGameIDDetailed;

async function getGame(game_id) {
    debugPrinter.printFunction(getGame.name);

    const result = {
        status: null,
        message: null,
        game: null,
    };

    // May be undefined
    const gameRow = await dbEngineGameUno.getGameRowSimpleByGameID(game_id);

    // If Game Row does not exist
    if (!gameRow) {
        result.status = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    result.game = gameRow;

    result.status = constants.SUCCESS;
    result.message = `Game ${game_id} returned`;

    return result;
}

gameUnoLogic.getGame = getGame;

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
 * Join a game
 *
 * Notes:
 *      This function is dependent on if the db is successful
 *
 * @param game_id
 * @param user_id
 * @returns {Promise<*>}
 */
async function joinGameIfPossible(game_id, user_id) {
    debugPrinter.printFunction(joinGameIfPossible.name);

    // debugPrinter.printDebug(`game_id: ${game_id} user_id: ${user_id}`);

    const result = {
        status: null,
        message: null,
        game: null,
        player: null,
    };

    const gameRow = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // Check if game exists
    if (!gameRow) {
        result.status = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    result.game = gameRow;

    // If game is active
    if (gameRow.is_active) {
        result.status = constants.FAILURE;
        result.message = `Game ${game_id} is active`;
        return result;
    }

    // Get player given game_id and user_id (May be undefined)
    const playerRowExists = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(game_id, user_id);

    // debugPrinter.printDebug(playerRowExists);

    // If player is exists for the user for the game
    if (playerRowExists) {
        result.status = constants.FAILURE;
        result.message = `Player ${playerRowExists.player_id} already exists for game ${game_id}`;
        result.player = playerRowExists;
        return result;
    }

    // Create Player (May be undefined)
    const playerRowNew = await dbEngineGameUno.createPlayerRowAndCreatePlayersRow(user_id, game_id);

    // If player row was not made
    if (!playerRowNew) {
        result.status = constants.FAILURE;
        result.message = `Player ${playerRowNew.player_id} could not join game ${game_id}`;
        return result;
    }

    result.status = constants.SUCCESS;
    result.message = `Player ${playerRowNew.player_id} was created and joined game ${game_id}`;
    result.player = playerRowNew;

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
async function leaveGame(game_id, user_id) {
    debugPrinter.printFunction(leaveGame.name);

    const result = {
        status: null,
        message: null,
        game: null,
        player: null,
        change_turn: null,
    };

    const gameRow = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    if (!gameRow) {
        result.status = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }
    result.game = gameRow;

    // May be undefined
    const playerRow = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(game_id, user_id);

    // If playerRow does not exist
    if (!playerRow) {
        result.status = constants.FAILURE;
        result.message = `Player ${playerRow.display_name} (player_id ${playerRow.player_id}) does not exist for game ${game_id}`;
        return result;
    }
    result.player = playerRow;

    if (playerRow.player_id === gameRow.player_id_host) {
        // May be empty
        result.game = await dbEngineGameUno.deleteGameRow(game_id); // Will also delete players in game
        result.message = `Game ${game_id} is removed and player ${playerRow.display_name} (player_id ${playerRow.player_id}) is removed`;
    } else {
        // WARNING, MUST CHANGE TURN BEFORE LEAVING OR ELSE THE GAME WILL CRASH
        if (gameRow.player_id_turn === playerRow.player_id) {
            const changeTurn = await gameUnoLogicHelper.changeTurnByGameRow(gameRow);

            if (changeTurn.status === constants.FAILURE) {
                result.status = changeTurn.status;
                result.message = changeTurn.message;
                // return result; // Do not return here because there is more stuff that needs to be returned
            }

            result.change_turn = changeTurn;
        }

        // May be empty
        result.player = await dbEngineGameUno.deletePlayerRowByPlayerID(playerRow.player_id);
        result.message = `Player ${playerRow.display_name} (player_id ${playerRow.player_id}) is removed from game ${game_id}`;
    }

    result.status = constants.SUCCESS;

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
        status: null,
        message: null,
        player: null,
        game: null,
        game_data: null,
        players: null,
    };

    // FIXME: WARNING: DANGEROUS, NOT ACID PROOF

    // May be undefined
    const playerRow = await dbEngineGameUno.createPlayerRow(user_id);
    // debugPrinter.printDebug(playerRow);

    if (!playerRow) {
        result.status = constants.FAILURE;
        result.message = 'Could not create player row when creating game';
        return result;
    }
    result.game = playerRow;

    // May be undefined
    const gameRow = await dbEngineGameUno.createGameRow(playerRow.player_id);
    // debugPrinter.printDebug(gameRow);

    if (!gameRow) {
        result.status = constants.FAILURE;
        result.message = 'Could not create game row when creating game';
        return result;
    }
    result.game = gameRow;

    const gameData = await dbEngineGameUno.createGameDataRow(gameRow.game_id);

    if (!gameData) {
        result.status = constants.FAILURE;
        result.message = 'Could not create game row when creating game';
        return result;
    }
    result.game_data = gameData;

    // May be undefined
    const playersRow = await dbEngineGameUno.createPlayersRow(gameRow.game_id, playerRow.player_id);
    // debugPrinter.printDebug(playersRow);

    if (!playersRow) {
        result.status = constants.FAILURE;
        result.message = 'Could not create players row when creating game, game will be deleted';

        await dbEngineGameUno.deleteGameRow(gameRow); // For safety, remove the game

        return result;
    }

    result.players = playersRow;

    result.status = constants.SUCCESS;
    result.message = `Game ${gameRow.game_id}, player ${playersRow.player_id}, game's players were created`;

    return result;
}

gameUnoLogic.createGameV2 = createGameV2;

async function reshuffleCollectionPlayBackToDrawAndMoveCardDrawToPlayIfCardPlayIsInvalid(gameRow) {
    debugPrinter.printFunction(reshuffleCollectionPlayBackToDrawAndMoveCardDrawToPlayIfCardPlayIsInvalid.name);

    const result = {
        status: null,
        message: null,
        game_data: null,
    };

    let gameDataResult = null;

    // FIXME: VERY DANGEROUS LOOP
    while (!gameDataResult || gameDataResult.status === constants.FAILURE) {
        // eslint-disable-next-line no-await-in-loop
        gameDataResult = await gameUnoLogicHelper.updateGameData(gameRow, null);

        if (gameDataResult.status === constants.FAILURE) {
            // eslint-disable-next-line no-await-in-loop
            await dbEngineGameUno.updateCollectionRowsPlayToDrawAndRandomizeDrawByGameID(gameRow.game_id);
            // eslint-disable-next-line no-await-in-loop
            await gameUnoLogic.moveCardDrawToPlay(gameRow.game_id);
        }
    }

    result.game_data = gameDataResult;
    result.status = constants.SUCCESS;
    result.message = `GameData (game_id ${gameDataResult.game_id}) was updated`;

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
async function startGame(game_id, user_id, deckMultiplier, drawAmountPerPlayer, callback_game_id) {
    debugPrinter.printFunction(startGame.name);

    // TODO: Assign player_index to players so you know the turn order. Maybe do this because we can use the player_id instead

    const result = {
        status: null,
        message: null,
        game: null,
        player: null,
        cards: null,
        players: null,
        change_turn: null,
    };

    let gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    if (!gameRowDetailed) {
        result.status = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    result.game = gameRowDetailed;

    // Get player given game_id and user_id (May be undefined)
    const playerRowHost = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(game_id, user_id);

    // If player is exists for the user for the game
    if (!playerRowHost) {
        result.status = constants.FAILURE;
        result.message = `Player does not exist for game ${game_id}`;
        return result;
    }
    result.player = playerRowHost;

    // If player_id is host and if game is not active, make it active
    if (gameRowDetailed.is_active === true) {
        result.status = constants.FAILURE;
        result.message = `Game ${game_id} is already active`;
        return result;
    }

    await dbEngineGameUno.updateGameRowIsActiveByGameID(game_id, true);

    // May be empty
    const cardRows = await dbEngineGameUno.createCardRowsAndCardsRowsAndCollectionRowsWithCollectionRandomized(gameRowDetailed.game_id, deckMultiplier);
    // debugPrinter.printDebug(cardRows);

    // Basically if cards not created
    if (!cardRows.length) {
        result.status = constants.FAILURE;
        result.message = `Cards could not be made for game ${game_id}, game ${game_id} will be deleted`;

        await dbEngineGameUno.deleteGameRow(gameRowDetailed); // For safety, remove the game

        return result;
    }

    result.cards = cardRows; // In this case, cardsRows is not cards, but cardRows is cards

    // May be empty
    await dbEngineGameUno.updatePlayersRowsInGameRows(game_id, true);

    const playerRows = await dbEngineGameUno.getPlayerRowsDetailedByGameID(gameRowDetailed.game_id);

    if (!playerRows.length) {
        result.status = constants.FAILURE;
        // result.message = `Error no players for game ${game_id}, game ${game_id} will be deleted`;
        result.message = `Error no players for game ${game_id}`;

        // await dbEngineGameUno.deleteGameRow(gameRowDetailed); // For safety, remove the game (DON'T DELETE GAME, COMMENT THIS OUT TO SUPPORT OPEN LOBBIES)

        return result;
    }
    result.players = playerRows;

    // New Game Row
    gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);
    result.game = gameRowDetailed;

    /* ----- Distribute Cards ----- */

    // eslint-disable-next-line no-restricted-syntax
    for (const playerRow of playerRows) {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < drawAmountPerPlayer; i++) {
            // eslint-disable-next-line no-await-in-loop,no-use-before-define
            await moveCardDrawToHandTopByGameIDAndPlayerRow(game_id, playerRow, callback_game_id);
        }
    }

    // TODO GUARD AND CHECK
    await gameUnoLogic.moveCardDrawToPlay(game_id);

    // TODO GUARD AND CHECK
    await reshuffleCollectionPlayBackToDrawAndMoveCardDrawToPlayIfCardPlayIsInvalid(gameRowDetailed);

    const changeTurn = await gameUnoLogicHelper.changeTurnByGameID(gameRowDetailed.game_id);

    if (changeTurn.status === constants.FAILURE) {
        result.status = changeTurn.status;
        result.message = changeTurn.message;
        return result;
    }

    result.change_turn = changeTurn;

    result.status = constants.SUCCESS;
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
        status: null,
        message: null,
        game: null,
        players: null,
        collection_draw: null,
        collection_play: null,
    };

    // May be undefined
    const gameRow = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // If Game Row does not exist
    if (!gameRow) {
        result.status = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    result.game = gameRow;

    // May be empty
    const playerRows = await dbEngineGameUno.getPlayerRowsDetailedByGameID(gameRow.game_id);

    result.players = playerRows;

    // eslint-disable-next-line no-restricted-syntax
    for (const playerRow of playerRows) {
        // eslint-disable-next-line no-await-in-loop
        playerRow.collection = await dbEngineGameUno.getCollectionRowsCollectionIndexByPlayerID(playerRow.player_id);
    }

    // May be empty
    result.collection_draw = await dbEngineGameUno.getCollectionRowCollectionIndexByGameIDAndCollectionInfoID(game_id, 1);

    // May be empty
    result.collection_play = await dbEngineGameUno.getCollectionRowDetailedByGameIDAndCollectionInfoID(game_id, 2);

    result.status = constants.SUCCESS;
    result.message = 'Game state returned';

    // Game state
    return result;
}

gameUnoLogic.getGameState = getGameState;

async function moveCardDrawToHandTopByGameIDAndPlayerRow(game_id, playerRow, callback_game_id) {
    debugPrinter.printFunction(moveCardDrawToHandTopByGameIDAndPlayerRow.name);

    const result = {
        status: null,
        message: null,
        game: null,
        player: null,
        collection: null,
        change_turn: null,
    };

    // May be undefined
    const gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // If Game Row does not exist
    if (!gameRowDetailed) {
        result.status = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    // If player is exists for the user for the game
    if (!playerRow) {
        result.status = constants.FAILURE;
        result.message = `Player does not exist for game ${game_id}`; // Short circuit because the playerRow is based on the game_id (don't need to check if game exists)
        return result;
    }
    result.player = playerRow;

    // TODO FUUUUUUUUUUUCK

    let collectionRowHand = null;

    let cardsDrew = 0;

    // Draw the appropriate amount of cards for the player
    while (cardsDrew < gameRowDetailed.draw_amount) {
        // If the server crashes, the player still needs to draw the appropriate amount of cards (May be undefined)
        // eslint-disable-next-line no-await-in-loop
        const gameData = await dbEngineGameUno.updateGameDataRowDrawAmount(game_id, cardsDrew);

        if (!gameData) {
            // result.status = constants.FAILURE;
            // result.message = `Game ${gameRowDetailed.game_id}'s GameData failed to update draw_amount`;
            // return result;

            debugPrinter.printError(`Error when Drawing cards for Game game_id ${game_id}`);
            /*
            If this break is hit, then something went wrong updating the db. This break should probably never be hit, but
            if it does then something went wrong

             */
            break;
        }

        // eslint-disable-next-line no-await-in-loop
        const collectionCountDraw = await dbEngineGameUno.getCollectionCountByGameIDAndCollectionInfoID(game_id, 1);

        // If there are no cards in the Collection DRAW, reshuffle Collection PLAY to Collection DRAW
        if (collectionCountDraw === 0) {
            // eslint-disable-next-line no-await-in-loop
            const gameDataRowNew = await reshuffleCollectionPlayBackToDrawAndMoveCardDrawToPlayIfCardPlayIsInvalid(gameRowDetailed);

            // Get the new Collection DRAW (May be empty)
            // eslint-disable-next-line no-await-in-loop
            const collectionCountDrawNew = await dbEngineGameUno.getCollectionCountByGameIDAndCollectionInfoID(game_id, 1);

            if (collectionCountDrawNew.length === 0) {
                // result.status = constants.FAILURE;
                // result.message = `Collection DRAW is still empty, ${playerRow.player_id} Should play cards`;
                // return result;

                /*
                If this break is hit, the game is in a complicated state where there no cards in the DRAW collection even after
                moving all the cards from the PLAY collection into the DRAW collection and playing 1 card from the DRAW to the PLAY.

                If the player can't play a card after all this drawing, the game will probably be in a soft lock state...

                TODO: Add code to prevent this soft lock by skipping the player if they can't play a legal card

                 */
                break;
            }

            // Execute the callback if necessary
            if (callback_game_id) {
                // eslint-disable-next-line no-await-in-loop
                await callback_game_id(game_id);
            }
        }

        // My be undefined
        // eslint-disable-next-line no-await-in-loop
        collectionRowHand = await dbEngineGameUno.updateCollectionRowDrawToHandTop(game_id, playerRow.player_id);

        if (!collectionRowHand) {
            result.status = constants.FAILURE;
            result.message = `Error in updating player ${playerRow.display_name} (player_id ${playerRow.player_id})'s collection`;
            return result;
        }

        // Execute the callback if necessary
        if (callback_game_id) {
            // eslint-disable-next-line no-await-in-loop
            await callback_game_id(game_id);
        }

        cardsDrew += 1;
    }

    // Reset draw amount
    await dbEngineGameUno.updateGameDataRowDrawAmount(game_id, 1);

    // TODO FUUUUUUUUUUUCK

    // Change turn if player draws when there is a WILDFOUR or DRAWTWO and the draw_amount is > 0 (Note that gameRowDetailed should be outdated by this point which is why this logic works)
    if (((gameRowDetailed.card_content_legal === constantsGameUno.CARD_CONTENT_WILDFOUR) || (gameRowDetailed.card_content_legal === constantsGameUno.CARD_CONTENT_DRAWTWO))
        && (gameRowDetailed.draw_amount > 1)) {
        const changeTurn = await gameUnoLogicHelper.changeTurnByGameID(gameRowDetailed.game_id);

        if (changeTurn.status === constants.FAILURE) {
            result.status = changeTurn.status;
            result.message = changeTurn.message;
            return result;
        }
    }

    result.collection = collectionRowHand;

    result.status = constants.SUCCESS;
    result.message = `A card from DRAW's collection moved to player ${playerRow.display_name} (player_id ${playerRow.player_id})'s collection's top for Game ${game_id}`;

    return result;
}

gameUnoLogic.moveCardDrawToHandTopByGameIDAndPlayerRow = moveCardDrawToHandTopByGameIDAndPlayerRow;

/*
{
    status,
    message,
    player,
    collection,
}
 */
async function moveCardDrawToHandTopByGameIdAndUseID(game_id, user_id) {
    debugPrinter.printFunction(moveCardDrawToHandTopByGameIdAndUseID.name);

    // Get player given game_id and user_id (May be undefined)
    const playerRow = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(game_id, user_id);

    return moveCardDrawToHandTopByGameIDAndPlayerRow(game_id, playerRow);
}

gameUnoLogic.moveCardDrawToHandTopByGameIdAndUseID = moveCardDrawToHandTopByGameIdAndUseID;

async function moveCardDrawToPlay(game_id) { // TODO ADD MORE GUARDING AND ERROR CHECKING ETC
    debugPrinter.printFunction(moveCardDrawToPlay.name);

    const result = {
        status: null,
        message: null,
        game: null,
        collection: null,
    };

    // May be undefined
    const gameRow = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // If Game Row does not exist
    if (!gameRow) {
        result.status = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    const collectionRow = await dbEngineGameUno.updateCollectionRowDrawToPlayTop(game_id);

    if (!collectionRow) {
        result.status = constants.FAILURE;
        result.message = `Error when updating PLAY's collection for Game ${game_id}`; // TODO FIX THEN
        return result;
    }
    result.collection = collectionRow;

    result.status = constants.SUCCESS;
    result.message = `A card from DRAW's collection moved to PLAY's collection's top for Game ${game_id}`; // TODO FIX THEN

    return result;
}

gameUnoLogic.moveCardDrawToPlay = moveCardDrawToPlay;

/**
 * Play card
 *
 * @param game_id
 * @param user_id
 * @param playObject
 * @returns {Promise<{player_current_turn_new: null, game: null, collection: null, message: null, status: null, player: null}>}
 */
async function moveCardHandToPlayByCollectionIndex(game_id, user_id, collection_index, color) {
    debugPrinter.printFunction(moveCardHandToPlayByCollectionIndex.name);

    const result = {
        status: null,
        message: null,
        player: null,
        game: null,
        game_logic: null,
    };

    // May be undefined
    const gameRow = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // If Game Row does not exist
    if (!gameRow) {
        result.status = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    // Get player given game_id and user_id (May be undefined)
    const playerRow = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(game_id, user_id);

    // If player is exists for the user for the game
    if (!playerRow) {
        result.status = constants.FAILURE;
        result.message = `Player ${playerRow.display_name} (player_id ${playerRow.player_id}) does not exist for game ${game_id}`;
        // Can be used as a short circuit because the playerRow is based on the game_id (don't need to check if game exists)
        return result;
    }
    result.player = playerRow;

    // Check if it's the player's turn
    if (gameRow.player_id_turn !== playerRow.player_id) {
        result.status = constants.FAILURE;
        result.message = `It is not Player ${playerRow.display_name} (player_id ${playerRow.player_id}) turn for game ${game_id}`;
        return result;
    }

    // TODO FUCK

    const gameLogic = await gameUnoLogicHelper.doMoveCardHandToPlayByCollectionIndexLogic(gameRow, playerRow, collection_index, color);

    if (gameLogic.status === constants.FAILURE) {
        result.status = gameLogic.status;
        result.message = gameLogic.message;
        return result;
    }

    result.game_logic = gameLogic;

    result.status = constants.SUCCESS;

    result.message = `Card (collection_index ${collection_index}) from player ${playerRow.display_name} \
    (player_id ${playerRow.player_id})'s collection moved to PLAY's collection's top for Game ${game_id}`;

    return result;
}

gameUnoLogic.moveCardHandToPlayByCollectionIndex = moveCardHandToPlayByCollectionIndex;

async function getHand(game_id, user_id) {
    debugPrinter.printFunction(getHand.name);

    const result = {
        status: null,
        message: null,
        player: null,
        collection: null,
    };

    const gameRow = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // Check if game exists
    if (!gameRow) {
        result.status = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    result.game = gameRow;

    // Get player given game_id and user_id (May be undefined)
    const playerRow = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(game_id, user_id);

    // If player is exists for the user for the game
    if (!playerRow) {
        result.status = constants.FAILURE;
        result.message = `Player does not exist for game ${game_id}`; // Short circuit because the playerRow is based on the game_id (don't need to check if game exists)
        return result;
    }
    result.player = playerRow;

    // May be undefined
    const collectionRow = await dbEngineGameUno.getCollectionRowDetailedByPlayerID(playerRow.player_id);

    // If player is exists for the user for the game
    if (!collectionRow) {
        result.status = constants.FAILURE;
        result.message = `Collection does not exist for player ${playerRow.display_name} (player_id ${playerRow.player_id})`;
        return result;
    }

    result.status = constants.SUCCESS;
    result.message = `Player ${playerRow.display_name} (player_id ${playerRow.player_id})'s hand returned`;

    result.collection = collectionRow;

    return result;
}

gameUnoLogic.getHand = getHand;

async function getPlayerDetailedByGameIDAndUserID(game_id, user_id) {
    debugPrinter.printFunction(getPlayerDetailedByGameIDAndUserID.name);

    const result = {
        status: null,
        message: null,
        game: null,
        player: null,
    };

    const gameRow = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // Check if game exists
    if (!gameRow) {
        result.status = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    result.game = gameRow;

    // Get player given game_id and user_id (May be undefined)
    const playerRow = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(game_id, user_id);

    // If player is exists for the user for the game
    if (!playerRow) {
        result.status = constants.FAILURE;
        result.message = `Player does not exist for game ${game_id}`; // Short circuit because the playerRow is based on the game_id (don't need to check if game exists)
        return result;
    }
    result.player = playerRow;

    result.status = constants.SUCCESS;
    result.message = `Player ${playerRow.display_name} (player_id ${playerRow.player_id}) returned`;

    return result;
}

gameUnoLogic.getPlayerDetailedByGameIDAndUserID = getPlayerDetailedByGameIDAndUserID;

async function setGamePlayerIDHost(game_id, user_id) {
    debugPrinter.printFunction(setGamePlayerIDHost.name);

    const result = {
        status: null,
        message: null,
        game: null,
        player: null,
    };

    const gameRow = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // Check if game exists
    if (!gameRow) {
        result.status = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }
    result.game = gameRow;

    // Get player given game_id and user_id (May be undefined)
    const playerRow = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(game_id, user_id);

    // If player is exists for the user for the game
    if (!playerRow) {
        result.status = constants.FAILURE;
        result.message = `Player does not exist for game ${game_id}`;

        return result;
    }
    result.player = playerRow;

    const gameRowNew = await dbEngineGameUno.updateGameRowPlayerIDHostByGameID(game_id, playerRow.player_id);

    if (!gameRowNew) {
        result.status = constants.FAILURE;
        result.message = `Could not update game ${game_id}'s player turn`;
        return result;
    }
    result.game = gameRowNew;

    result.status = constants.SUCCESS;
    result.message = `Player ${playerRow.display_name} (player_id ${playerRow.player_id}) is not the host of game ${game_id}`;

    return result;
}

gameUnoLogic.setGamePlayerIDHost = setGamePlayerIDHost;

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
