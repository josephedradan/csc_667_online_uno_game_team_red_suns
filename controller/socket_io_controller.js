/*

 */

const connectionContainer = require('../server/server');

const { io } = connectionContainer;

const debugPrinter = require('../util/debug_printer');
const dbEngineMessage = require('./db_engine_message');
const dbEngineGameUno = require('./db_engine_game_uno');

// io.on('connection', (socket) => {
//     debugPrinter.printSuccess(`Client Socket 1: ${socket.id}`);
//
//     socket.request.joseph = 'Joseph says hi';
//
//     debugPrinter.printError(socket.request.joseph);
//
//     // debugPrinter.printSuccess(socket.request);
//
//     // socket.on('message', (message)=>{
//     //     debugPrinter.printError(message)
//     // })
//
//     socket.emit('message', 'From Server'); // Client
//     // socket.broadcast.emit('message', "Test") // Everyone but clietn
//     // io.emit('message', "Test") // // all
// });
//
// // LOOKS LIKE .useExpressMiddleware ARE ALWAYS CALLED BEFORE ANY on is hit
// io.use((socket, next) => {
//     debugPrinter.printMiddleware('SOCKET MIDDLEWARE');
//     next();
// });
//
// io.on('connection', (socket) => {
//     debugPrinter.printSuccess(`Client Socket2 : ${socket.id}`);
//     debugPrinter.printError(socket.request.joseph);
//     debugPrinter.printError(socket.request.game);
//
//     // debugPrinter.printDebug(socket.request.session.passport.user);
//     debugPrinter.printDebug(socket.request.user);
//     debugPrinter.printDebug(socket.request.url);
//     debugPrinter.printDebug(socket.request.headers);
//     debugPrinter.printDebug(socket.request.method);
//
//     socket.on('temp', (string) => {
//         debugPrinter.printDebug(string);
//     });
//
//     // socket.on('message', (message)=>{
//     //     debugPrinter.printError(message)
//     // })
// });

async function initialSocketJoin(socket) {
    /*
    THE BELOW VARIABLES MOST LIKELY CAME FROM EXPRESS MIDDLEWARE APPLIED TO THE
    SOCKET IO SERVER INSTANCE VIA io.use

    IF THE VARIABLES CAME FROM EXPRESS MIDDLEWARE THEN YOU CAN TREAT THEM SIMILAR TO
    HOW THEY ARE USED IN EXPRESS

     */
    const {
        user, // THIS MAY EXIST AND SHOULD NOT CHANGE WHEN THE SOCKET IS CONNECTED
    } = socket.request;

    // If the user is logged in
    if (user) {
        debugPrinter.printMiddlewareSocketIO('SOCKET LOGGED IN');
        debugPrinter.printDebug(user);

        // Join socket to a room (THIS SHOULD BE CALLED ONCE EVERY TIME A USER IS DIRECTED TO A GAME)
        socket.on('client-join-room', async (game_id_client) => {
            debugPrinter.printBackendMagenta('client-join-room');
            debugPrinter.printSuccess(game_id_client);
            debugPrinter.printSuccess(typeof (game_id_client));

            if (game_id_client) {
                socket.join(game_id_client);

                // Assign game_id to socket.request.game_id
                socket.request.game_id = game_id_client;

                const resultPlayerRow = await dbEngineGameUno.getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID(
                    socket.request.game_id,
                    socket.request.user.user_id,
                );

                // debugPrinter.printBackendRed(resultPlayerRow);

                // Assign player_id to socket.request.player_id
                socket.request.player_id = resultPlayerRow.player_id;

                const user_temp = await dbEngineGameUno.getUserByPlayerID(resultPlayerRow.player_id);

                // TODO: WARNING, THIS IS NOT RECORDED BY THE SERVER
                io.in(socket.request.game_id)
                    .emit('server-message', {
                        display_name: 'Server',
                        message: `${user_temp.display_name} has joined`,
                    });

                // debugPrinter.printDebug({
                //     user_temp,
                //     game_id: socket.request.game_id,
                //     player_id: socket.request.player_id,
                // });
                // debugPrinter.printBackendRed('END');
            }
        });

        // If user's player is in a game
        if (socket.request.game_id) {
            // socket.on('client-message', async (message) => {
            //     debugPrinter.printBackendMagenta('client-message');
            //
            //     debugPrinter.printDebug({
            //         user,
            //         game_id: socket.request.game_id,
            //         player_id: socket.request.player_id,
            //     });
            //
            //     debugPrinter.printDebug(message);
            //
            //     const result = await dbEngineMessage.createMessageRow(socket.request.game_id, socket.request.player_id, message);
            //
            //     io.in(socket.request.game_id)
            //         .emit('server-game-message', result);
            // });
        }
    }
}

io.on('connection', initialSocketJoin);
