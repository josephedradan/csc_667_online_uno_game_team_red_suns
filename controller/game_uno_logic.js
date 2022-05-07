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
        await dbEngineGameUno.updateGameDataPlayerIDTurnByGameID(gameRow.game_id, playerRowsActive[0].player_id);
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

    result.game_data = await dbEngineGameUno.updateGameDataPlayerIDTurnByGameID(gameRow.game_id, result.player_id_turn);

    result.status = constants.SUCCESS;
    result.message = `Player ${result.player_id_turn} has the turn`;

    return result;
}

gameUnoLogic.changeTurnAndGetPlayerRowDetailedByGameID = changeTurnAndGetPlayerRowDetailedByGameID;

async function doGameLogic(gameRow, playObject) {
    const result = {
        status: null,
        message: null,
        game: gameRow,
        // game_data: null,
        // players_active: null,
        // player_id_turn: null,
        // user_id_turn: null,
    };

    const changeTurnObject = await gameUnoLogic.changeTurnAndGetPlayerRowDetailedByGameID(gameRow);

    if (changeTurnObject.status === constants.FAILURE) {
        result.status = changeTurnObject.status;
        result.message = changeTurnObject.message;
        return result;
    }
}

gameUnoLogic.doGameLogic = doGameLogic;

module.exports = gameUnoLogic;
