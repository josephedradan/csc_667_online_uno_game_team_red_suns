const e = require('express');
const debugPrinter = require('../util/debug_printer');
const dbEngineGameUno = require('./db_engine_game_uno');
const constants = require('../config/constants');
const unoCardConstants = require('../config/constants_game_uno');

const set = new Set(unoCardConstants.LEGAL_COLORS);

function isValidColor(color) {
    debugPrinter.printBackendMagenta(set.has(color));
    return set.has(color);
}

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
    await dbEngineGameUno.updateGameDataSkipAmount(gameRow.game_id, 0);
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
async function updateGameData(gameRow, color) {
    debugPrinter.printFunction(updateGameData.name);
    debugPrinter.printBackendCyan(gameRow);

    const result = {
        status: null,
        game: null,
        message: null,
        change_turn: null,
        card_legal: null,
    };

    if (!color && isValidColor(color)) {
        result.status = constants.FAILURE;
        result.message = `Improper color by game_id: ${gameRow.game_id} color: ${color}`;
        return result;
    }

    const collectionRowPlayTop = await dbEngineGameUno.getCollectionRowTopDetailedByGameIDAndCollectionInfoID(gameRow.game_id, 2);

    debugPrinter.printBackendGreen(collectionRowPlayTop);

    if (!collectionRowPlayTop) {
        result.status = constants.FAILURE;
        result.message = `Get Collection of the Top Card of the Play Stack failed, it's empty game_id: ${gameRow.game_id}`;
        return result;
    }

    const temp = {
        collection_index: collectionRowPlayTop.collection_index,
        color: collectionRowPlayTop.color,
        content: collectionRowPlayTop.content,
        type: collectionRowPlayTop.type,
    };
    debugPrinter.printBackendBlue(temp);

    // Use playObject's color by default if it exists
    if (color && temp.color === unoCardConstants.CARD_COLOR_BLACK) {
        temp.color = color;
    }
    // debugPrinter.printError(playObject);
    // debugPrinter.printBackendBlue(temp);

    // If temp.color is black

    // wildfour causes a draw of four cards, wild doesnt cause a draw. Both causes a change in color chosen by the player.
    debugPrinter.printBackendWhite(temp.color);
    debugPrinter.printBackendWhite(color);
    if (temp.color === unoCardConstants.CARD_COLOR_BLACK) {
        result.status = constants.FAILURE;
        result.message = `Top Card of PLAY's collection is black for game ${gameRow.game_id}. No color is selected, suggest a reshuffle`;
        return result;
    }

    // May be undefiend
    const cardLegal = await dbEngineGameUno.updateGameDataCardLegal(gameRow.game_id, temp.type, temp.content, temp.color);

    debugPrinter.printError(cardLegal);
    if (!cardLegal) {
        result.status = constants.FAILURE;
        result.message = `Failed to update gameDate ${gameRow.game_id} legal card`;
        return result;
    }
    result.card_legal = cardLegal;

    // TODO: REMEMBER TO IMPLEMENT THE RESETTERS.
    // Assume db queries will be successful since it lacks user input, guards preffered
    if (temp.content === unoCardConstants.SPECIALS_CONTENT_WILDFOUR) {
        // await dbEngineGameUno.updateGameDataDrawAmount(gameRow.game_id, 4);
        if (gameRow.draw_amount > 1) {
            await dbEngineGameUno.updateGameDataDrawAmount(gameRow.game_id, gameRow.draw_amount + 4);
        } else {
            await dbEngineGameUno.updateGameDataDrawAmount(gameRow.game_id, 4);
        }
    } else if (temp.content === unoCardConstants.SPECIALS_CONTENT_DRAWTWO) {
        await dbEngineGameUno.updateGameDataDrawAmount(gameRow.game_id, 2);
    } else if (temp.content === unoCardConstants.SPECIALS_CONTENT_REVERSE) {
        await dbEngineGameUno.updateGameDataIsClockwise(gameRow.game_id, !gameRow.is_clockwise);
    } else if (temp.content === unoCardConstants.SPECIALS_CONTENT_SKIP) {
        await dbEngineGameUno.updateGameDataSkipAmount(1);
    }

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

// Helpers for : doMoveCardHandToPlayByCollectionIndexLogic

async function doMoveCardHandToPlayByCollectionIndexLogic(gameRow, playerRow, collection_index, color) {
    debugPrinter.printFunction(doMoveCardHandToPlayByCollectionIndexLogic.name);
    debugPrinter.printBackendMagenta(color);
    debugPrinter.printBackendWhite('FUC');

    const result = {
        status: null,
        message: null,
        collection: null,
        game_data: null,
    };

    if (!color && isValidColor(color)) {
        result.status = constants.FAILURE;
        result.message = `Improper color by player_id: ${gameRow.game_id} color: ${color}`;
        return result;
    }

    // Check if card collection_index index exists (May be undefined)
    const collectionRowHandByCollectionIndex = await dbEngineGameUno.getCollectionRowHandDetailedByCollectionIndex(playerRow.player_id, collection_index);

    if (!collectionRowHandByCollectionIndex) {
        result.status = constants.FAILURE;
        result.message = `Player ${playerRow.display_name} (player_id ${playerRow.player_id})'s Card (collection_index ${collection_index}) does not exist`;
        // Can be used as a short circuit because the playerRow is based on the game_id (don't need to check if game exists)
        return result;
    }

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
    const queryResult = await dbEngineGameUno.updateCollectionRowHandToPlayByCollectionIndexAndGetCollectionRowDetailed(gameRow.game_id, playerRow.player_id, collection_index);
    if (!queryResult) {
        result.status = constants.FAILURE;
        result.message = `Update to the Collection table by hand to play unsuccessful. player_id: ${playerRow.player_id} at collection_index: ${collection_index}`;
    }

    const gameData = await gameUnoLogic.updateGameData(gameRow, color);
    console.log('-------------------------------------UPDATING GAME_DATA-------------------------------------');

    if (gameData.status === constants.FAILURE) {
        result.status = gameData.status;
        result.message = gameData.message;
        return result;
    }
    result.message = `VALID MOVE;\n
                    COLOR: ${collectionRowHandByCollectionIndex.color}
                    CONTENT: ${collectionRowHandByCollectionIndex.content}
                    PLAYER_ID: ${collectionRowHandByCollectionIndex.player_id}
                    GAME_ID: ${collectionRowHandByCollectionIndex.game_id}`; // TODO WRITE THIS
    result.game_data = gameData;
    debugPrinter.printBackendGreen(result);
    return result;
}

gameUnoLogic.doMoveCardHandToPlayByCollectionIndexLogic = doMoveCardHandToPlayByCollectionIndexLogic;

module.exports = gameUnoLogic;
