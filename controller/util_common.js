/*
Common utility functions used by controllers

 */

const debugPrinter = require('../util/debug_printer');

const utilCommon = {};

function attachMessageToSessionMessageIfPossible(req, status_game_uno, message) {
    const body = {
        status_game_uno,
        message,
    };

    if (req.session) {
        req.session.message = body;
    }

    return body;
}

utilCommon.attachMessageToSessionMessageIfPossible = attachMessageToSessionMessageIfPossible;

function getJsonResponseCommon(status_game_uno, message, url) {
    const body = {
        status_game_uno,
        message,
        url: url || '/',
    };
    return body;
}
utilCommon.getJsonResponseCommon = getJsonResponseCommon;

function getJsonResponseAndAttachMessageToSessionMessageIfPossible(req, status_game_uno, message, url) {
    const result = attachMessageToSessionMessageIfPossible(req, status_game_uno, message);
    return getJsonResponseCommon(result.status_game_uno, result.message, url);
}

utilCommon.getJsonResponseAndAttachMessageToSessionMessageIfPossible = getJsonResponseAndAttachMessageToSessionMessageIfPossible;

module.exports = utilCommon;
