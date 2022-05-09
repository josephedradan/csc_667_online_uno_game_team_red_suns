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
        game: null,
        message: null,
        change_turn: null,
        card_legal: null,
    };

    const collectionRowPlayTop = await dbEngineGameUno.getCollectionRowTopDetailedByGameIDAndCollectionInfoID(gameRow.game_id, 2);

    debugPrinter.printBackendGreen(collectionRowPlayTop);

    const temp = {
        collection_index: collectionRowPlayTop.collection_index,
        color: collectionRowPlayTop.color,
        content: collectionRowPlayTop.content,
        type: collectionRowPlayTop.type,
    };
    debugPrinter.printBackendBlue(temp);

    // Use playObject's color by default if it exists
    if (playObject.color) {
        temp.color = playObject.color;
    }
    debugPrinter.printError(playObject);
    debugPrinter.printBackendBlue(temp);

    // If temp.color is black
    if (temp.color === 'black') {
        result.status = constants.FAILURE;
        result.message = `Top Card of PLAY's collection is black for game ${gameRow.gameid}. No color is selected, suggest a reshuffle`;
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
// eslint-disable-next-line no-shadow
const applyAndAcceptPlay = async (result, gameRow, playerRow, playObject) => {
    // Update Player's collection & Update PLAY's collection (May be empty)
    debugPrinter.printFunction(applyAndAcceptPlay.name);
    const collectionRowHandUpdated = await dbEngineGameUno.updateCollectionRowHandToPlayByCollectionIndexAndGetCollectionRowDetailed(
        gameRow.game_id,
        playerRow.player_id,
        playObject.collection_index,
    );

    if (!collectionRowHandUpdated) {
        // eslint-disable-next-line no-param-reassign
        result.status = constants.FAILURE;
        // eslint-disable-next-line no-param-reassign
        result.message = `Failed to update Collection ${gameRow.game_id}`;
    }

    // eslint-disable-next-line no-param-reassign
    result.status = constants.SUCCESS;
    // eslint-disable-next-line no-param-reassign
    result.collection = collectionRowHandUpdated;
};

const verifyPlayerHand = async (gameRow) => {
    debugPrinter.printFunction(verifyPlayerHand.name);
    // Grab the the current state of the player's hand collection
    const playerHand = await dbEngineGameUno.getCollectionRowDetailedByPlayerID(gameRow.player_id_turn);
    if (!playerHand) {
        debugPrinter.printBackendRed(`${verifyPlayerHand.name} FAILED`);
        return false;
    }
    // Loop through this player's hand collection and find one instance of a card that is the same color as the card in the play stack.
    // if there is a LEGAL card in the player's hand return false.
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < playerHand.length; i++) {
        if (playerHand[i].color === gameRow.card_color_legal) {
            return false;
        }
    }
    return true;
};

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
        result.message = `Player ${playerRow.display_name} 
        (player_id ${playerRow.player_id})'s Card (collection_index 
        ${playObject.collection_index}) does not exist`;
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

    if (collectionRowHandByCollectionIndex.color === 'black') {
        // - verify the player's hand to see if the has no legal cards left to play
        // 'wild' accept the play
        if (collectionRowHandByCollectionIndex.content === 'wild') {
            applyAndAcceptPlay(result, gameRow, playerRow, playObject);
        } else if (verifyPlayerHand(gameRow)) {
            // 'wildFour' verify the player's hand accept the play if hand does not meet color req.
            // TODO: Accepting play for now but if varifyPlayerHand is false we should reject the play outside of this.
            applyAndAcceptPlay(result, gameRow, playerRow, playObject); // accept.... for now.
        }
    } else if (collectionRowHandByCollectionIndex.color === gameRow.card_color_legal || collectionRowHandByCollectionIndex.content === gameRow.card_content_legal) {
        // Accept Play
        applyAndAcceptPlay(result, gameRow, playerRow, playObject);
    } else {
        // Reject play
        // write onto result notifying error.
        result.status = constants.FAILURE;
        result.message = `Illegal card play;
        COLOR: ${collectionRowHandByCollectionIndex.color}
        CONTENT: ${collectionRowHandByCollectionIndex.content}
        PLAYER_ID:${collectionRowHandByCollectionIndex.player_id}
        GAME_ID:${collectionRowHandByCollectionIndex.game_id}`;
        // return result prematurely as to avoid updates.
        debugPrinter.printBackendRed(result);
        return result;
    }

    console.log('-------------------------------------UPDATING GAME_DATA-------------------------------------');
    const gameData = await gameUnoLogic.updateGameData(gameRow, playObject);

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
