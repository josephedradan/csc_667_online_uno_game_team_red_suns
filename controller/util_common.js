/*
Common utility functions used by controllers

 */

const debugPrinter = require('../util/debug_printer');

const utilCommon = {};

function attachMessageToSessionMessageIfPossible(req, status, message) {
    const body = {
        status,
        message,
    };

    if (req.session) {
        req.session.message = body;
    }

    return body;
}

utilCommon.reqSessionMessageHandler = attachMessageToSessionMessageIfPossible;

function getJsonResponseCommon(req, status, message, url) {
    const body = {
        status,
        message,
        url: url || '/',
    };
    return body;
}
utilCommon.getJsonResponseCommon = getJsonResponseCommon;

function getJsonResponseAndCallAttachMessageToSessionMessageIfPossible(req, status, message, url) {
    const result = attachMessageToSessionMessageIfPossible(req, status, message);
    return getJsonResponseCommon(req, result.status, result.message, url);
}

utilCommon.getJsonResponseAndCallAttachMsesageToSessionMessageIfPossible = getJsonResponseAndCallAttachMessageToSessionMessageIfPossible;

module.exports = utilCommon;
