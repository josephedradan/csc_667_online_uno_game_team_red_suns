const dbEngineGameUno = require('../controller/db_engine_game_uno');
const gameUnoSettings = require('../config/game_uno_settings');
const utilCommon = require('../controller/util_common');
const constants = require('../config/constants');
const debugPrinter = require('../util/debug_printer');

const middlewareUnoGameSettings = {};

async function checkIfPlayersMaxIsReached(req, res, next) {
    const result = await dbEngineGameUno.getPlayersCountByGameID(
        req.game.game_id
    ); // TODO WARNING, DANGEROUS NEED TO CHECK IF RESULT IS UNDEFINED

    if (result > gameUnoSettings.PLAYERS_MAX) {
        const jsonResponse =
            utilCommon.getJsonResponseAndAttachMessageToSessionMessageIfPossible(
                req,
                constants.FAILURE,
                `Max players reached for game ${req.game.game_id}`
            );
        res.redirect(jsonResponse.url);
    } else {
        next();
    }
}

middlewareUnoGameSettings.checkIfPlayerLimitIsReached = checkIfPlayersMaxIsReached;

async function checkIfPlayersMinIsReached(req, res, next) {
    const result = await dbEngineGameUno.getPlayersCountByGameID(req.game.game_id); // TODO WARNING, DANGEROUS NEED TO CHECK IF RESULT IS UNDEFINED

    debugPrinter.printError('LOOK HERE');

    debugPrinter.printError(result);
    debugPrinter.printError(gameUnoSettings.PLAYERS_MIN);

    if (result < gameUnoSettings.PLAYERS_MIN) {
        const jsonResponse = utilCommon.getJsonResponseCommon(
            constants.FAILURE,
            'At least 2 players must be in the game to start',
            null,
        );
        debugPrinter.printError('LOOK HERE');
        res.json(jsonResponse);
    } else {
        next();
    }
}

middlewareUnoGameSettings.checkIfPlayersMinIsReached = checkIfPlayersMinIsReached;

module.exports = middlewareUnoGameSettings;
