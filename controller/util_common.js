/*
Common utility functions used by controllers

 */

const utilCommon = {};

function reqSessionMessageHandler(req, status, message) {
    const body = {
        status,
        message,
    };

    req.session.message = body;

    return body;
}

utilCommon.reqSessionMessageHandler = reqSessionMessageHandler;

function getJsonResponseAndCallReqSessionMessageHandler(req, status, message, url) {
    const result = reqSessionMessageHandler(req, status, message);

    const body = {
        status: result.status,
        message: result.message,
        url: url || '/',
    };

    return body;
}

utilCommon.getJsonResponseAndCallReqSessionMessageHandler = getJsonResponseAndCallReqSessionMessageHandler;

module.exports = utilCommon;
