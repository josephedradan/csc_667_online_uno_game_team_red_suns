/*
This file wraps over a socket.io server instance and does some interaction between that socket server instance
and some kind of express related object such as express middleware

IMPORTANT NOTES:
    MIDDLEWARE GIVEN TO io.useExpressMiddleware WORK DIFFERENTLY FROM application.useExpressMiddleware FROM EXPRESS. ALL io.useExpressMiddleware CALLS ARE CALLED FIRST
    BEFORE ANY FUNCTION LIKE io.on IS CALLED. BASICALLY, ALL MIDDLEWARE IS APPLIED FIRST BEFORE ANY SOCKET.IO
    FUNCTIONALITY CAN HAPPEN.

    ALSO CALL next() IN THE MIDDLEWARE OR THE SOCKET WILL HANG

Notes:
    handlerSocketIOUseExpress.useExpressMiddleware
        Given an express.io object example:
            const socket_io = require('socket.io');
            ...
            const serverHttp = http.createServer(application);
            ...
            const io = new socket_io.Server(serverHttp);
            connectionContainer.io = io;

        expose a function called 'useExpressMiddleware' to allow middleware to be applied to the
        socket object that comes from io.useExpressMiddleware

        Note that socket.io's socket objects have only req via socket.request and next
        meaning that modifications to res can be modified, but you will not have access to
        it

Reference:

    Middlewares
        Notes:
            socket.io middleware

        Reference:
            https://socket.io/docs/v4/middlewares/

        Notes:
            9-year-old post on how to useExpressMiddleware express, socket.io, and passport

            Some code does not work, but the idea is to look at this example:

                // Set up the Socket.IO server
                var io = require("socket.io")(application)
                    .useExpressMiddleware(function(socket, next){
                        // Wrap the express middleware
                        sessionMiddleware(socket.request, {}, next);
                    })
                    .on("connection", function(socket){
                        var userId = socket.request.session.passport.user;
                        console.log("Your User ID is", userId);
                    });

        Reference:
            https://stackoverflow.com/questions/13095418/how-to-use-passport-with-express-and-socket-io

    Integrating Socket.IO
        Notes:
            socket.io basics
        Reference:
            https://socket.io/get-started/chat#integrating-socketio

    Combine sockets and express when using express middleware?
        Notes:
        Reference:
            https://stackoverflow.com/questions/42379952/combine-sockets-and-express-when-using-express-middleware

    Usage of Passport JWT Strategy for Authentication in Socket.IO
        Notes:
            If you care about passport then use the below
                const wrapMiddlewareForSocketIo = middleware => (socket, next) => middleware(socket.request, {}, next);
        Rerference:
            https://philenius.github.io/web%20development/2021/03/31/use-passportjs-for-authentication-in-socket-io.html

 */

const connectionContainer = require('../server/server');
const debugPrinter = require('../util/debug_printer');

const { io } = connectionContainer;

const handlerSocketIOUseExpress = {};

/**
 * Given middleware that takes in 3 arguments such as middleware(req, res, next), apply that middleware
 * to all sockets.
 *
 * IMPORTANT NOTES:
 *      THE MIDDLEWARE MUST CALL next() OR THE SOCKET WILL HANG
 *
 * Notes:
 *      Basically, give this function middleware that:
 *          1. changes/affects req
 *          2. does nothing to res (because socket.io does not useExpressMiddleware res)
 *          3. can call next
 *
 *      All effects on req can be accessed via socket.request
 *
 * Examples:
 *      If you give the middleware such as
 *          passport.initialize()
 *          passport.session()
 *
 *      to this function You will have express session with passport applied to
 *      the socket connection which works very similar to the express equivalent
 *
 *
 * @param middlewareReqResNext
 * @returns {Promise<void>}
 */
async function useExpressMiddleware(middlewareReqResNext) {
    debugPrinter.printMiddleware(useExpressMiddleware.name);

    io.use((socket, next) => {
        middlewareReqResNext(socket.request, socket.request.res, next); // Note that socket.request.response is occupied, do not use it
    });
}

handlerSocketIOUseExpress.useExpressMiddleware = useExpressMiddleware;
module.exports = handlerSocketIOUseExpress;
