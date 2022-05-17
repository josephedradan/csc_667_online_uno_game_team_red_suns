const e = require('express');
const debugPrinter = require('../util/debug_printer');
const dbEngineGameUno = require('./db_engine_game_uno');
const constants = require('../config/constants');
const constantsGameUno = require('../config/constants_game_uno');
const dbEngine = require('./db_engine');
const gameUnoSpecial = require('./game_uno_special');

const set = new Set(constantsGameUno.CARD_COLORS_SELECETABLE_LEGEAL);

function isValidSlectableColor(color) {
    return set.has(color);
}

const gameUnoLogicHelper = {};

/**
 * IMPORTANT NOTES:
 *      THIS FUNCTION ASSUMES gameRowDetailed IS UP TO DATE OR ELSE LOGIC WILL FAIL
 *
 * @param gameRowDetailed
 * @returns {Promise<{players_active: null, status_game_uno: null, message: null, player_id_previous: null, user_id_turn: null}>}
 */
async function getUserIDAndPlayerIDPreviousByGameRow(gameRowDetailed) {
    debugPrinter.printFunction(getUserIDAndPlayerIDPreviousByGameRow.name);

    const result = {
        status_game_uno: null,
        message: null,
        players_active: null,
        player_id_previous: null,
        user_id_previous: null,
    };

    // May be empty
    let playerRowsActive = await dbEngineGameUno.getPlayerRowsSimpleInGame(gameRowDetailed.game_id);

    if (!playerRowsActive.length) {
        result.status_game_uno = constants.FAILURE;
        result.message = `No active players in game ${gameRowDetailed.game_id}`;
        return result;
    }

    if (gameRowDetailed.is_clockwise !== false) {
        playerRowsActive = playerRowsActive.reverse();
    }

    result.players_active = playerRowsActive;

    let indexOfCurrentPlayer = null; // FIXME ME, MIGHT BE DANGEROUS

    playerRowsActive.forEach((playerRow, index) => {
        if (gameRowDetailed.player_id_turn === playerRow.player_id) {
            indexOfCurrentPlayer = index;
        }
    });

    const indexOfPreviousPlayerInPlayerRowsActive = ((indexOfCurrentPlayer + 1) % playerRowsActive.length);

    result.player_id_previous = playerRowsActive[indexOfPreviousPlayerInPlayerRowsActive].player_id;
    result.user_id_previous = playerRowsActive[indexOfPreviousPlayerInPlayerRowsActive].user_id;

    result.status_game_uno = constants.SUCCESS;
    result.message = `Game ${gameRowDetailed.game_id}, player (player_id ${result.player_id_previous}) was the previous player_id`;

    return result;
}

gameUnoLogicHelper.getUserIDAndPlayerIDPreviousByGameRow = getUserIDAndPlayerIDPreviousByGameRow;

/**
 * IMPORTANT NOTES:
 *      THIS FUNCTION ASSUMES gameRowDetailed IS UP TO DATE OR ELSE LOGIC WILL FAIL
 *
 * @param game_id
 * @returns {Promise<void>}
 */
async function changeTurnByGameRow(gameRowDetailed) {
    debugPrinter.printFunction(changeTurnByGameRow.name);

    const result = {
        status_game_uno: null,
        message: null,
        game_data: null,
        players_active: null,
        player_id_turn: null,
        user_id_turn: null,
    };

    // May be empty
    let playerRowsActive = await dbEngineGameUno.getPlayerRowsSimpleInGame(gameRowDetailed.game_id);

    if (!playerRowsActive.length) {
        result.status_game_uno = constants.FAILURE;
        result.message = `No active players in game ${gameRowDetailed.game_id}`;
        return result;
    }

    // debugPrinter.printBackendWhite(playerRowsActive);

    // If there is no player_id for the game
    if (gameRowDetailed.player_id_turn === null) { // TODO: Maybe use "Players".player_index in the future
        await dbEngineGameUno.updateGameDataRowPlayerIDTurn(gameRowDetailed.game_id, playerRowsActive[0].player_id);
        result.status_game_uno = constants.SUCCESS;
        result.message = `Game ${gameRowDetailed.game_id}'s player_id_turn was null, player ${playerRowsActive[0].player_id} will have the turn`;
        result.player_id_turn = playerRowsActive[0].player_id;
        result.user_id_turn = playerRowsActive[0].user_id;
        return result;
    }

    if (gameRowDetailed.is_clockwise === false) {
        playerRowsActive = playerRowsActive.reverse();
    }

    result.players_active = playerRowsActive;

    let indexOfCurrentPlayer = null; // FIXME ME, MIGHT BE DANGEROUS

    playerRowsActive.forEach((playerRow, index) => {
        if (gameRowDetailed.player_id_turn === playerRow.player_id) {
            indexOfCurrentPlayer = index;
        }
    });

    const indexOfNextPlayerInPlayerRowsActive = (indexOfCurrentPlayer + 1 + gameRowDetailed.skip_amount)
        % playerRowsActive.length;

    await dbEngineGameUno.updateGameDataRowSkipAmount(
        gameRowDetailed.game_id,
        0,
    );

    result.user_id_turn = playerRowsActive[indexOfNextPlayerInPlayerRowsActive].user_id;
    result.player_id_turn = playerRowsActive[indexOfNextPlayerInPlayerRowsActive].player_id;

    const gameData = await dbEngineGameUno.updateGameDataRowPlayerIDTurn(
        gameRowDetailed.game_id,
        result.player_id_turn,
    );

    if (!gameData) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${gameRowDetailed.game_id}'s GameData failed to update`;
        return result;
    }

    result.game_data = gameData;

    result.status_game_uno = constants.SUCCESS;
    result.message = `Game ${gameRowDetailed.game_id}, player (player_id ${result.player_id_turn}) has the turn`;

    return result;
}

gameUnoLogicHelper.changeTurnByGameRow = changeTurnByGameRow;

async function changeTurnByGameID(game_id) {
    debugPrinter.printFunction(changeTurnByGameID.name);
    const gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(
        game_id,
    );

    const result = {
        status: null,
        message: null,
    };

    if (!gameRowDetailed) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${game_id} does not exist`;
        return result;
    }

    return changeTurnByGameRow(gameRowDetailed);
}

gameUnoLogicHelper.changeTurnByGameID = changeTurnByGameID;

/**
 * IMPORTANT NOTES:
 *      THIS FUNCTION ASSUMES gameRowDetailed IS UP TO DATE OR ELSE LOGIC WILL FAIL
 *
 * Notes:
 *      Process:
 *          1. Update gameData stuff
 * @param gameRowDetailed
 * @param color
 * @returns {Promise<{game, message: null, status: null}>}
 */
async function updateGameDataFullByGameRow(gameRowDetailed, color) {
    debugPrinter.printFunction(updateGameDataFullByGameRow.name);

    const result = {
        status_game_uno: null,
        message: null,
        game: null,
    };

    // Check if color is real color that is selectable by a player, if there was a player
    if (!color && isValidSlectableColor(color)) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Improper color by game_id: ${gameRowDetailed.game_id} color: ${color}`;
        return result;
    }

    // Get the top card of the PLAY collection
    const collectionRowPlayTop = await dbEngineGameUno.getCollectionRowTopDetailedByGameIDAndCollectionInfoID(gameRowDetailed.game_id, 2);

    if (!collectionRowPlayTop) {
        result.status_game_uno = constants.FAILURE;
        result.message = `game_id: ${gameRowDetailed.game_id}, getting the top card from the PLAY Collection failed`;
        return result;
    }

    const temp = {
        collection_index: collectionRowPlayTop.collection_index,
        color: collectionRowPlayTop.color,
        content: collectionRowPlayTop.content,
        type: collectionRowPlayTop.type,
    };

    // Use playObject's color by default if it exists
    if (color && temp.color === constantsGameUno.CARD_COLOR_BLACK) {
        temp.color = color;
    }
    // debugPrinter.printError(playObject);
    // debugPrinter.printBackendBlue(temp);

    // If temp.color is black (Wild +4 causes a draw of four cards, wild doesn't cause a draw. Both causes a change in color chosen by the player.)
    if (temp.color === constantsGameUno.CARD_COLOR_BLACK) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Top Card of PLAY's collection is black for game ${gameRowDetailed.game_id}. No color is selected, suggest a reshuffle`;
        return result;
    }
    // Get GameData (May be undefined)
    const gameDataRow = await dbEngineGameUno.updateGameDataRowCardLegal(gameRowDetailed.game_id, temp.type, temp.content, temp.color);

    if (!gameDataRow) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Failed to update gameDate ${gameRowDetailed.game_id} legal card`;
        return result;
    }

    // TODO: CHECK AND GUARD THE BELOW

    // TODO: NOT A NICE WAY TO DO IT, BUT IT'S OK
    let gameDataNew = gameRowDetailed;

    // Assume that the db queries will be successful since the player does not have a input
    if (temp.content === constantsGameUno.CARD_CONTENT_WILDFOUR) {
        if (gameRowDetailed.draw_amount > 1) {
            gameDataNew = await dbEngineGameUno.updateGameDataRowDrawAmount(
                gameRowDetailed.game_id,
                gameRowDetailed.draw_amount + 4,
            );
        } else {
            gameDataNew = await dbEngineGameUno.updateGameDataRowDrawAmount(
                gameRowDetailed.game_id,
                4,
            );
        }
    } else if (temp.content === constantsGameUno.CARD_CONTENT_DRAWTWO) {
        if (gameRowDetailed.draw_amount > 1) {
            gameDataNew = await dbEngineGameUno.updateGameDataRowDrawAmount(
                gameRowDetailed.game_id,
                gameRowDetailed.draw_amount + 2,
            );
        } else {
            gameDataNew = await dbEngineGameUno.updateGameDataRowDrawAmount(
                gameRowDetailed.game_id,
                2,
            );
        }
    } else if (temp.content === constantsGameUno.CARD_CONTENT_REVERSE) {
        gameDataNew = await dbEngineGameUno.updateGameDataRowIsClockwise(
            gameRowDetailed.game_id,
            !gameRowDetailed.is_clockwise,
        );
    } else if (temp.content === constantsGameUno.CARD_CONTENT_SKIP) {
        gameDataNew = await dbEngineGameUno.updateGameDataRowSkipAmount(
            gameRowDetailed.game_id,
            1,
        );
    }

    // TODO NOT CORRECT PLACE TO PUT THIS
    // Assume that the db queries will be successful since the player does not have a input
    // if (temp.content === constantsGameUno.CARD_CONTENT_WILDFOUR && gameDataNew.draw_amount > 1) {
    //     await dbEngineGameUno.updateGameDataRowIsChallengeAvailable(gameDataRow.game_id, true);
    // } else {
    //     // Automatically set is_challenge_available back to false
    //     await dbEngineGameUno.updateGameDataRowIsChallengeAvailable(gameDataRow.game_id, false);
    // }

    // debugPrinter.printError(gameRowDetailed)
    /* ----- Check for Uno and check to see if the game can end ----- */

    let player_id_winner = null;

    const isUnoAvailable = false;

    // May be empty (TODO GUARD)
    const playerRowsActive = await dbEngineGameUno.getPlayerRowsSimpleInGame(gameRowDetailed.game_id);

    // eslint-disable-next-line no-restricted-syntax
    for (const playerRow of playerRowsActive) {
        // eslint-disable-next-line no-await-in-loop
        const collectionCountHand = await dbEngineGameUno.getCollectionCountByPlayerID(playerRow.player_id);
        if (collectionCountHand === 1) {
            // eslint-disable-next-line no-await-in-loop
            // const first = dbEngineGameUno.updateGameDataRowIsUnoAvailable(gameRowDetailed.game_id, true);
            // const second = dbEngineGameUno.updatePlayerRowIsUnoCheckedByGameIdAndPlayerId(gameRowDetailed.game_id, playerRow.player_id, true);

            // eslint-disable-next-line no-await-in-loop
            // await Promise.all([first]);
            // isUnoAvailable = true;
        } else if (collectionCountHand === 0) { // Required
            player_id_winner = playerRow.player_id;
            break;
        } else {
            // MAYBE USE THIS?
            // eslint-disable-next-line no-await-in-loop
            // await dbEngineGameUno.updatePlayerRowIsUnoCheckedByGameIdAndPlayerId(gameRowDetailed.game_id, playerRow.player_id, false);
        }
    }

    // If there is a winner in the game
    if (player_id_winner) {
        // eslint-disable-next-line no-restricted-syntax
        await Promise.all(playerRowsActive.map(async (playerRow) => {
            if (playerRow.player_id === player_id_winner) {
                return dbEngine.incrementUserStatisticRowNumWins(playerRow.user_id);
            }
            return dbEngine.incrementUserStatisticRowNumLoss(playerRow.user_id);
        }));
    }

    // TODO: NOT CALLED WHICH IS CORRECT
    // Reset is_uno_available back to false if there is no Uno Available
    if (!isUnoAvailable) {
        await dbEngineGameUno.updateGameDataRowIsUnoAvailable(gameRowDetailed.game_id, false);
    }

    // Get the most up to date game (May be Undefined)
    const gameRowDetailedMostUpToDate = await dbEngineGameUno.getGameRowDetailedByGameID(gameDataRow.game_id);

    if (!gameRowDetailedMostUpToDate) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${gameDataRow.game_id} does not exist`;
        return result;
    }

    // Do a special throw to end the game
    if (player_id_winner) {
        const playerRowDetailedWinner = await dbEngineGameUno.getPlayerRowDetailedByPlayerID(player_id_winner);

        const message = `The winner is ${playerRowDetailedWinner.display_name} (player_id :${playerRowDetailedWinner.player_id}) `
            + `of game_id ${gameRowDetailed.game_id}`;

        throw new gameUnoSpecial.GameUnoWinner(message, gameRowDetailedMostUpToDate, playerRowDetailedWinner);
    }

    result.game = gameRowDetailedMostUpToDate;

    result.status_game_uno = constants.SUCCESS;
    result.message = `Game ${gameRowDetailed.game_id}'s GameData was successfully updated`;
    return result;
}

gameUnoLogicHelper.updateGameDataFullByGameRow = updateGameDataFullByGameRow;

async function updateGameDataFull(game_id, color) {
    debugPrinter.printFunction(updateGameDataFull.name);

    debugPrinter.printError('JOSEPH LOOK 2');
    const gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);
    debugPrinter.printError(gameRowDetailed);

    return updateGameDataFullByGameRow(gameRowDetailed, color);
}

gameUnoLogicHelper.updateGameDataFull = updateGameDataFull;

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
 * @param gameRowDetailed
 * @param playerRowDetailed
 * @param collection_index
 * @param color
 * @returns {Promise<void>}
 */

// Helpers for : doMoveCardHandToPlayByCollectionIndexLogic

async function doMoveCardHandToPlayByCollectionIndexLogic(
    gameRowDetailed,
    playerRowDetailed,
    collection_index,
    color,
) {
    debugPrinter.printFunction(doMoveCardHandToPlayByCollectionIndexLogic.name);

    const result = {
        status_game_uno: null,
        message: null,
        collection: null,
        game: null,
        change_turn: null,
    };

    // Check if color is real color that is selectable by a player, if there was a player
    if (!color && isValidSlectableColor(color)) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${gameRowDetailed.game_id}, player ${playerRowDetailed.display_name} (player_id ${playerRowDetailed.player_id}) played an invalid color ${color}`;
        return result;
    }

    // Check if card collection_index index exists (May be undefined)
    const collectionRowHandByCollectionIndex = await dbEngineGameUno.checkCollectionRowHandDetailedByCollectionIndex(playerRowDetailed.player_id, collection_index);

    if (!collectionRowHandByCollectionIndex) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${gameRowDetailed.game_id}, player ${playerRowDetailed.display_name} (player_id ${playerRowDetailed.player_id})'s \
        Card (collection_index ${collection_index}) does not exist`; // Can be used as a short circuit because the playerRowDetailed is based on the game_id (don't need to check if game exists)

        return result;
    }
    // TODO STUFF IN HERE START

    debugPrinter.printBackendWhite(collectionRowHandByCollectionIndex);
    debugPrinter.printGreen(gameRowDetailed);

    // If the game's card_content_legal (top card) is a Wild +4
    if ((gameRowDetailed.card_content_legal === constantsGameUno.CARD_CONTENT_WILDFOUR)
        && (gameRowDetailed.card_content_legal !== collectionRowHandByCollectionIndex.content)
        && gameRowDetailed.draw_amount > 1) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${gameRowDetailed.game_id}, player ${playerRowDetailed.display_name} (player_id ${playerRowDetailed.player_id}) \
        must play a Card with content ${constantsGameUno.CARD_CONTENT_WILDFOUR} or must draw cards}`;
        debugPrinter.printBackendBlue(result.message);

        return result;
    }

    debugPrinter.printError('YO YO YO');
    debugPrinter.printError(gameRowDetailed);
    // If the game's card_content_legal (top card) is a Draw +2
    if ((gameRowDetailed.card_content_legal === constantsGameUno.CARD_CONTENT_DRAWTWO)
        && (gameRowDetailed.card_content_legal !== collectionRowHandByCollectionIndex.content)
        && gameRowDetailed.draw_amount > 1) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${gameRowDetailed.game_id}, player ${playerRowDetailed.display_name} (player_id ${playerRowDetailed.player_id}) \
        must play a Card with content ${constantsGameUno.CARD_CONTENT_DRAWTWO} or must draw cards}`;
        debugPrinter.printBackendRed(result.message);
        return result;
    }

    // TODO STUFF IN HERE END

    // Play the card by its collection_index from the player's Collection (HAND) to the PLAY Collection ()
    const collectionRowsNew = await dbEngineGameUno.updateCollectionRowHandToPlayByCollectionIndexAndGetCollectionRowsDetailed(
        gameRowDetailed.game_id,
        playerRowDetailed.player_id,
        collection_index,
    );

    if (!collectionRowsNew) {
        result.status_game_uno = constants.FAILURE;
        result.message = `Game ${gameRowDetailed.game_id}, player ${playerRowDetailed.display_name} (player_id ${playerRowDetailed.player_id}), Update to the player's collection failed`;
    }
    result.collection = collectionRowsNew;

    // ALLOW CHALLENGE, THIS MUST BE PLACED HERE
    if (collectionRowHandByCollectionIndex.content === constantsGameUno.CARD_CONTENT_WILDFOUR) {
        await dbEngineGameUno.updateGameDataRowIsChallengeAvailable(gameRowDetailed.game_id, true);
    }

    const gameData = await gameUnoLogicHelper.updateGameDataFullByGameRow(
        gameRowDetailed,
        color,
    );

    if (gameData.status_game_uno === constants.FAILURE) {
        result.status_game_uno = gameData.status;
        result.message = gameData.message;
        return result;
    }
    result.game = gameData;

    const changeTurn = await gameUnoLogicHelper.changeTurnByGameRow(
        gameData.game,
    );
    result.change_turn = changeTurn;

    if (changeTurn.status_game_uno === constants.FAILURE) {
        result.status_game_uno = changeTurn.status;
        result.message = changeTurn.message;
        return result;
    }

    const playerCollectionCount = await dbEngineGameUno.getCollectionCountByPlayerID(playerRowDetailed.player_id);

    const arrayPromises = [];

    if (playerCollectionCount === 1) {
        arrayPromises.push(dbEngineGameUno.updatePlayerRowIsUnoCheckedByGameIdAndPlayerId(gameRowDetailed.game_id, playerRowDetailed.player_id, true));
        arrayPromises.push(dbEngineGameUno.updateGameDataRowIsUnoAvailable(gameRowDetailed.game_id, true));
    } else {
        arrayPromises.push(dbEngineGameUno.updatePlayerRowIsUnoCheckedByGameIdAndPlayerId(gameRowDetailed.game_id, playerRowDetailed.player_id, false));
    }
    await Promise.all(arrayPromises);

    result.message = `Game ${gameRowDetailed.game_id}, player ${playerRowDetailed.display_name} (player_id ${playerRowDetailed.player_id}) `
        + `has successfully played their Card (collection_index ${collection_index})'`;

    result.status_game_uno = constants.SUCCESS;

    return result;
}

gameUnoLogicHelper.doMoveCardHandToPlayByCollectionIndexLogic = doMoveCardHandToPlayByCollectionIndexLogic;

async function isWildFourPlayLegal(gameRowDetailed, collectionRowsChallenged) {
    debugPrinter.printFunction(isWildFourPlayLegal.name);

    // const result = {
    //     status_game_uno: null,
    //     message: null,
    //     boolean: null,
    // };

    // Get Previous card to check its color
    const collectionRowPrevious = await dbEngineGameUno.getCollectionRowPlayPrevious(gameRowDetailed.game_id);

    // TODO GUARD
    if (!collectionRowPrevious) {
        // result.status_game_uno: constants.FAILURE;
        // result.message: "Could not get previous card from Collection PLAY";
        // return result
        return false;
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const collectionRow of collectionRowsChallenged) {
        if (collectionRow.color === collectionRowPrevious.color) {
            return false;
        }
    }
    return true;
}

gameUnoLogicHelper.isWildFourPlayLegal = isWildFourPlayLegal;

async function canPlayerChallenge(gameRowDetailed, playerRow) {
    debugPrinter.printFunction(canPlayerChallenge.name);

    // Not player's turn
    if (gameRowDetailed.player_id_turn !== playerRow.player_id) {
        return false;
    }

    // Get the top card of the PLAY collection
    const collectionRowPlayTop = await dbEngineGameUno.getCollectionRowTopDetailedByGameIDAndCollectionInfoID(gameRowDetailed.game_id, 2);

    // TODO GUARD
    if (!collectionRowPlayTop) {
        // result.status_game_uno = constants.FAILURE;
        // result.message = `game_id: ${gameRowDetailed.game_id}, getting the top card from the PLAY Collection failed`;
        // return result;
        return false;
    }

    if (gameRowDetailed.is_challenge_available === false) {
        return false;
    }

    if (collectionRowPlayTop.content === constantsGameUno.CARD_CONTENT_WILDFOUR) {
        return true;
    }
    return false;
}

gameUnoLogicHelper.canPlayerChallenge = canPlayerChallenge;

module.exports = gameUnoLogicHelper;
