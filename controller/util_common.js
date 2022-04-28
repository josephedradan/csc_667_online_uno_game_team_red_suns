/*
Common utility functions used by controllers

 */

const utilCommon = {};

function reqSessionMessageHandler(req, status, message) {
    req.session.message = {
        status,
        message,
    };
}

utilCommon.reqSessionMessageHandler = reqSessionMessageHandler;

module.exports = utilCommon;
