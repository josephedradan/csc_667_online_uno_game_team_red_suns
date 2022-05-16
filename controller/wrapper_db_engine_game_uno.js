const to = require('await-to-js').default;

const dbEngineGameUno = require('./db_engine_game_uno');
const gameUnoError = require('./game_uno_error');
const constants = require('../config/constants');

const wrapperDBEngineGameUno = {};

async function getGameRowDetailedByGameIDWrapped(game_id) {
    // Get game (May be undefined)
    const gameRowDetailed = await dbEngineGameUno.getGameRowDetailedByGameID(game_id);

    // If undefined
    if (!gameRowDetailed) {
        throw new gameUnoError.GameUnoGetGameError(game_id);
    }

    return gameRowDetailed;
}
wrapperDBEngineGameUno.getGameRowDetailedByGameIDWrapped = getGameRowDetailedByGameIDWrapped;

async function getPlayerRowsDetailedByGameIDWrapped(user_id, game_id) {
    // Get player (May be undefined)
    const playerRowDetailed = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(user_id, game_id);

    // If undefined
    if (!playerRowDetailed) {
        throw new gameUnoError.GameUnoGetPlayerError(user_id, game_id);
    }

    return playerRowDetailed;
}
wrapperDBEngineGameUno.getPlayerRowsDetailedByGameIDWrapped = getPlayerRowsDetailedByGameIDWrapped;

module.exports = wrapperDBEngineGameUno;

/// /////////////////// /////////////////// /////////////////// /////////////////// ////////////////
/// /////////////////// /////////////////// /////////////////// /////////////////// ////////////////

// // Get game
// const gameRowDetailed = wrapperDBEngineGameUno.getGameRowDetailedByGameIDWrapped(game_id);
//
// result.game = gameRowDetailed;
//
// // Get player
// const playerRowDetailed = wrapperDBEngineGameUno.getPlayerRowsDetailedByGameIDWrapped(user_id, game_id);
//
// result.player = playerRowDetailed;
//
//
// result.status_game_uno = constants.SUCCESS;
// status_game_uno: null,
