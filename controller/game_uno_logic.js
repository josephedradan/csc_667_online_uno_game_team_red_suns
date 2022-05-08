const debugPrinter = require('../util/debug_printer');
const dbEngineGameUno = require('./db_engine_game_uno');
const constants = require('../server/constants');

const gameUnoLogic = {};

/**
 * IMPORTANT NOTES:
 *      USE THIS FUNCTION IN THIS FILE ONLY
 *
 * @param game_id
 * @returns {Promise<void>}
 */
async function changeTurnAndGetPlayerRowDetailedByGameID(gameRow) {
    debugPrinter.printFunction(changeTurnAndGetPlayerRowDetailedByGameID.name);

    const result = {
        status: null,
        message: null,
        game: gameRow,
        game_data: null,
        players_active: null,
        player_id_turn: null,
        user_id_turn: null,
    };

    // May be empty
    let playerRowsActive = await dbEngineGameUno.getPlayerRowsGameIsActive(gameRow.game_id);

    if (!playerRowsActive.length) {
        result.status = constants.FAILURE;
        result.message = `No active players in game ${gameRow.game_id}`;
        return result;
    }

    // If there is no player_id for the game
    if (gameRow.player_id_turn === null) { // TODO: Maybe use "Players".player_index in the future
        await dbEngineGameUno.updateGameDataPlayerIDTurn(gameRow.game_id, playerRowsActive[0].player_id);
        result.status = constants.SUCCESS;
        result.message = `Game ${gameRow.game_id}'s player_id_turn was null, player ${playerRowsActive[0].player_id} will have the turn`;
        result.player_id_turn = playerRowsActive[0].player_id;
        result.user_id_turn = playerRowsActive[0].user_id;
        return result;
    }

    if (gameRow.is_clockwise !== false) {
        playerRowsActive = playerRowsActive.reverse();
    }

    result.players_active = playerRowsActive;

    let indexOfCurrentPlayer = null; // FIXME ME, MIGHT BE DANGEROUS

    playerRowsActive.forEach((playerRow, index) => {
        if (gameRow.player_id_turn === playerRow.player_id) {
            indexOfCurrentPlayer = index;
        }
    });

    const indexOfNextPlayerInPlayerRowsActive = ((indexOfCurrentPlayer + 1 + gameRow.skip_amount) % playerRowsActive.length);

    result.user_id_turn = playerRowsActive[indexOfNextPlayerInPlayerRowsActive].user_id;
    result.player_id_turn = playerRowsActive[indexOfNextPlayerInPlayerRowsActive].player_id;

    result.game_data = await dbEngineGameUno.updateGameDataPlayerIDTurn(gameRow.game_id, result.player_id_turn);

    result.status = constants.SUCCESS;
    result.message = `Player ${result.player_id_turn} has the turn`;

    return result;
}

gameUnoLogic.changeTurnAndGetPlayerRowDetailedByGameID = changeTurnAndGetPlayerRowDetailedByGameID;

/**
 * Notes:
 *      This function DOES NOT check if soemthignsd TODO
 *
 *      Process:
 *          1. Update gameData stuff
 * @param gameRow
 * @param playObject
 * @returns {Promise<{game, message: null, status: null}>}
 */
async function updateGameData(gameRow, playObject) {
    debugPrinter.printFunction(updateGameData.name);

    const result = {
        status: null,
        message: null,
        change_turn: null,
    };

    const temp = {
        collection_index: playObject.collection_index,
        color: playObject.color,
        content: playObject.content,
        type: playObject.type,
    };

    const collectionRowPlayTop = await gameUnoLogic.getCollectionRowTopDetailedByGameIDAndCollectionInfoID(gameRow.game_id, 2);

    temp.collection_index = collectionRowPlayTop.collection_index;
    temp.type = collectionRowPlayTop.type;
    temp.content = collectionRowPlayTop.content;

    if (temp.color) {
        temp.color = collectionRowPlayTop.color;
    }

    const s = dbEngineGameUno.updateGameDataCardLegal(gameRow.game_id, temp.type, temp.content, temp.color);

    const changeTurnObject = await gameUnoLogic.changeTurnAndGetPlayerRowDetailedByGameID(gameRow);

    if (changeTurnObject.status === constants.FAILURE) {
        result.status = changeTurnObject.status;
        result.message = changeTurnObject.message;
        return result;
    }

    result.change_turn = changeTurnObject;

    result.status = constants.SUCCESS;
    result.message = 'YAYAYAYAYYA'; // TODO YAYAYAYY
    return result;
}

gameUnoLogic.updateGameData = updateGameData;

/**
 * Notes:
 *      Process:
 *          1. Check if can play card
 *              a. Check if card collection_index index exists
 *              b. Check against gameData
 *          2. Play card
 *              a. Update Player's collection & Update PLAY's collection
 *          3. Update gameData stuff
 *
 * @param gameRow
 * @param playerRow
 * @param playObject
 * @returns {Promise<void>}
 */
async function doMoveCardHandToPlayByCollectionIndexLogic(gameRow, playerRow, playObject) {
    debugPrinter.printFunction(doMoveCardHandToPlayByCollectionIndexLogic.name);

    const result = {
        status: null,
        message: null,
        collection: null,
        game_data: null,
    };

    // Check if card collection_index index exists (May be undefined)
    const collectionRowHandByCollectionIndex = await dbEngineGameUno.getCollectionRowHandDetailedByCollectionIndex(playerRow.player_id, playObject.collection_index);

    if (!collectionRowHandByCollectionIndex) {
        result.status = constants.FAILURE;
        result.message = `Player ${playerRow.display_name} (player_id ${playerRow.player_id})'s 
        Card (collection_index ${playObject.collection_index}) does not exist`; // Can be used as a short circuit because the playerRow is based on the game_id (don't need to check if game exists)
        return result;
    }

    // TODO  Check against gameData, LEGAL BY COLOR OR NUMBER,

    /**
     * grab the card at the top of the play stack
     * grab the card that the player wants to play
     *
     * if (the card is a black card {wildFour or wild}) {
     *   - verify the player's hand to see if the has no legal cards left to play // Leaves them open to 'challenge' in the future functionality
     *   - Accept the play.
     * } else if (the card's color is the same OR the card's content is the same) {
     *   - Accept the play.
     * } else {
     *   - Reject the play.
     * }
     *
     */




        // Update Player's collection & Update PLAY's collection (May be empty)
    const collectionRowHandUpdated = await dbEngineGameUno.updateCollectionRowHandToPlayByCollectionIndexAndGetCollectionRowDetailed(
            gameRow.game_id,
            playerRow.player_id,
            playObject.collection_index,
        );

    result.collection = collectionRowHandUpdated;

    const gameData = await gameUnoLogic.updateGameData(gameRow, playObject);

    if (gameData.status === constants.FAILURE) {
        result.status = gameData.status;
        result.message = gameData.message;
        return result;
    }

    result.game_data = gameData;

    result.status = constants.SUCCESS;
    result.message = 'Logic Done'; // TODO WRITE THIS

    return result;
}

gameUnoLogic.doMoveCardHandToPlayByCollectionIndexLogic = doMoveCardHandToPlayByCollectionIndexLogic;

module.exports = gameUnoLogic;
