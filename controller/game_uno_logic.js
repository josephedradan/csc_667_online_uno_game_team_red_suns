const debugPrinter = require('../util/debug_printer');
const dbEngineGameUno = require('./db_engine_game_uno');
const gameUno = require('./game_uno');

const gameUnoLogic = {};

/**
 * IMPORTANT NOTES:
 *      USE THIS FUNCTION IN THIS FILE ONLY
 *
 * @param game_id
 * @returns {Promise<void>}
 */
async function changeTurnAndGetPlayerRowDetailedByGameID(game_id, skipAmount) {
    debugPrinter.printFunction(changeTurnAndGetPlayerRowDetailedByGameID.name);

    let playerRows = await dbEngineGameUno.getPlayerRowsGameIsActive(game_id);
    if (!playerRows.length) {
        return null;
    }

    const gameRow = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    if (!gameRow) {
        return null;
    }

    // If there is no player_id for the game
    if (gameRow.player_id_turn === null) { // TODO: Maybe use "Players".player_index in the future
        await dbEngineGameUno.updateGameDataPlayerIDTurnByGameID(game_id, playerRows[0].player_id);
        return dbEngineGameUno.getPlayerRowDetailedByPlayerID(playerRows[0].player_id);
    }

    if (gameRow.is_clockwise !== false) {
        playerRows = playerRows.reverse();
    }

    let indexOfCurrentPlayer = null; // FIXME ME, MIGHT BE DANGEROUS

    playerRows.forEach((playerRow, index) => {
        if (gameRow.player_id_turn === playerRow.player_id) {
            indexOfCurrentPlayer = index;
        }
    });

    const indexOfNextPlayer = ((indexOfCurrentPlayer + 1 + skipAmount) % playerRows.length);

    const user_id_current_turn_new = playerRows[indexOfNextPlayer].user_id;
    const player_id_turn_new = playerRows[indexOfNextPlayer].player_id;

    await dbEngineGameUno.updateGameDataPlayerIDTurnByGameID(game_id, player_id_turn_new);

    // eslint-disable-next-line no-use-before-define
    return gameUno.getPlayerDetailedByGameIDAndUserID(game_id, user_id_current_turn_new);
}

gameUnoLogic.changeTurnAndGetPlayerRowDetailedByGameID = changeTurnAndGetPlayerRowDetailedByGameID;

async function doGameLogicStuffIDK() {

}
gameUnoLogic.doGameLogicStuffIDK = doGameLogicStuffIDK;

module.exports = gameUnoLogic;
