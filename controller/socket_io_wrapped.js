/*
This file wraps over a socket.io objact and allows to apply express like middleware to
socket objects.

IMPORTANT NOTES:
    MIDDLEWARE GIVEN TO io.use WORK DIFFERENTLY FROM app.use FROM EXPRESS. ALL io.use CALLS ARE CALLED FIRST
    BEFORE ANY FUNCTION LIKE io.on IS CALLED. BASICALLY, ALL MIDDLEWARE IS APPLIED FIRST BEFORE ANY SOCKET.IO
    FUNCTIONALITY CAN HAPPEN.

    ALSO CALL next() OR THE SOCKET WILL HANG

Notes:
    Given an express.io object example:
        const socket_io = require('socket.io');
        ...
        const serverHttp = http.createServer(app);
        ...
        const io = new socket_io.Server(serverHttp);
        connectionContainer.io = io;

    expose a function called 'use' to allow middleware to be applied to the
    socket object that comes from io.use

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
            9-year-old post on how to use express, socket.io, and passport

            Some code does not work, but the idea is to look at this example:

                // Set up the Socket.IO server
                var io = require("socket.io")(app)
                    .use(function(socket, next){
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

 */

/* ############################## socket.io ############################## */

const connectionContainer = require('../server/server');
const debugPrinter = require('../util/debug_printer');

const { io } = connectionContainer;

const socketIOWrapped = {};

io.on('connection', (socket) => {
    debugPrinter.printSuccess(`Client Socket 1: ${socket.id}`);

    // debugPrinter.printSuccess(socket.request);

    socket.emit('message', 'Test'); // Client
    // socket.broadcast.emit('message', "Test") // Everyone but clietn
    // io.emit('message', "Test") // // all
});

// // LOOKS LIKE .use ARE ALWAYS CALLED BEFORE ANY on is hit
// io.use((socket, next) => {
//     debugPrinter.printMiddleware('SOCKET MIDDLEWARE');
//     next();
// });

io.on('connection', (socket) => {
    debugPrinter.printSuccess(`Client Socket2 : ${socket.id}`);

    // debugPrinter.printDebug(socket.request.session.passport.user);
    debugPrinter.printDebug(socket.request.user);
    // debugPrinter.printDebug(socket.request.url);
    // debugPrinter.printDebug(socket.request.headers);

    socket.on('temp', (string) => {
        debugPrinter.printDebug(string);
    });
});

io.on('connection', (socket) => {
    debugPrinter.printBackendYellow('SOCKET');
    // If logged in
    if (socket.request) {
        const room = socket.request.headers.referer;

        // make socket join room
        socket.on('join-room', () => {
            // Join room based on their referer url
            socket.join(room);

            debugPrinter.printSuccess(`${socket.id} joined room: ${room}`);

            // callback(`${socket.id} join room: ${room}`);
        });

        socket.on('message', (message) => {

            // TODO ADD DB STUFF

            // socket.to(room)
            //     .emit(message);

            io.in(room)
                .emit(message); // YOU WANT THIS ONE BECAUSE OF DB CALLS

        });
    }
});

/**
 * Given middleware that takes in 3 arguments such as middleware(req, res, next), apply that middleware
 * to all sockets.
 *
 * IMPORANT NOTES:
 *      THE MIDDLEWARE MUST CALL next() OR THE SOCKET WILL HANG
 *
 * Notes:
 *      Basically, give this function middleware that:
 *          1. changes/affects req
 *          2. does nothing to res (because socket.io does not use res)
 *          3. can call next
 *
 *      All effects on req can be accessed via socket.request
 *
 * Examples:
 *      If you give the middleware such as TODO passport and exprss session...
 *
 * @param middlewareReqResNext
 * @returns {Promise<void>}
 */
async function use(middlewareReqResNext) {
    io.use((socket, next) => {
        middlewareReqResNext(socket.request, {}, next);
    });
}

socketIOWrapped.use = use;
module.exports = socketIOWrapped;
