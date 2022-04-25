/*
This file contains middleware that connects express middleware to socket.io socket instances

PROBLEM: CALLING A NEW io.use and io.on WILL ADD MORE COPIES OF THIS MIDDLEWARE TO THE SOCKET IO SERVER INSTANCE
 */
const connectionContainer = require('../server/server');
const debugPrinter = require('../util/debug_printer');

const { io } = connectionContainer;

const middlewareExpressToSocketIO = {};

/**
 * Attach the game object from res.locals.game to socket.request.game
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function attachGameToSocketIORequest(req, res, next) {
    debugPrinter.printMiddleware(attachGameToSocketIORequest.name);

    io.use((socket, socketNext) => {
        debugPrinter.printMiddlewareSocketIO(attachGameToSocketIORequest.name);
        socket.request.game = res.locals.game;
        debugPrinter.printDebug(res.locals.game);
        socketNext();
    });
    // io.on('connection', (socket) => {
    //     debugPrinter.printMiddlewareSocketIO(attachGameToSocketIORequest.name);
    //     socket.request.game = res.locals.game;
    // });

    next();
}

// middlewareExpressToSocketIO.attachGameToSocketIORequest = attachGameToSocketIORequest;

async function attachPlayerToSocketIORequest(req, res, next) {
    debugPrinter.printMiddleware(attachPlayerToSocketIORequest.name);

    io.use((socket, socketNext) => {
        debugPrinter.printMiddlewareSocketIO(attachPlayerToSocketIORequest.name);
        socket.request.player = res.locals.player;
        debugPrinter.printDebug(res.locals.player);

        socketNext();
    });

    // io.on('connection', (socket) => {
    //     debugPrinter.printMiddlewareSocketIO(attachPlayerToSocketIORequest.name);
    //     socket.request.game = res.locals.game;
    // });

    next();
}

// middlewareExpressToSocketIO.attachPlayerToSocketIORequest = attachPlayerToSocketIORequest;

module.exports = middlewareExpressToSocketIO;
