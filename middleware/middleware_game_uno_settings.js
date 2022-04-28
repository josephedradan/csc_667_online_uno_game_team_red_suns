const configGameUno = require('../config/config_game_uno.json');
const dbEngineGameUno = require('../controller/db_engine_game_uno');

const middlewareUnoGameSettings = {};

async function checkIfPlayerLimitIsReached(req, res, next) {
    const result = dbEngineGameUno.getNumberOfPlayersRowsByGameID(req.game.game_id);

    if (result <= configGameUno.players_max) {
        next();
    }
}

middlewareUnoGameSettings.checkIfPlayerLimitIsReached = checkIfPlayerLimitIsReached;

module.exports = middlewareUnoGameSettings;
