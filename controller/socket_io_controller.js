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
        game_id, // THIS MAY EXIST AND SHOULD NOT CHANGE WHEN THE SOCKET IS CONNECTED (THIS IS game_id AND NOT game, game SHOULD CHANGE OVER TIME)
        player_id, // THIS MAY EXIST AND SHOULD NOT CHANGE WHEN THE SOCKET IS CONNECTED (THIS IS game_id AND NOT player_id, player SHOULD CHANGE OVER TIME)
    } = socket.request;

    // If the user is logged in
    if (user) {
        debugPrinter.printMiddlewareSocketIO('SOCKET LOGGED IN');
        debugPrinter.printDebug(user);
        debugPrinter.printDebug(game_id);
        debugPrinter.printDebug(player_id);

        // Join socket to a room (THIS SHOULD BE CALLED ONCE EVERY TIME A USER IS DIRECTED TO A GAME)
        socket.on('client-join-room', async (game_id_client) => {
            debugPrinter.printBackendMagenta('client-join-room');

            if (game_id_client) {
                socket.join(game_id_client);

                // Assign game_id to socket.request.game_id
                socket.request.game_id = game_id_client;

                const resultPlayerRow = await dbEngineGameUno.getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID(
                    socket.request.game_id,
                    socket.request.user.user_id,
                );

                // Assign player_id to socket.request.player_id
                socket.request.player_id = resultPlayerRow.player_id;

                socket.emit('server-message', `You have joined ${game_id_client} room`);
            }
        });

        // If user's player is in a game
        if (game_id) {
            socket.on('client-message', async (message) => {
                debugPrinter.printBackendMagenta('client-message');

                debugPrinter.printDebug({
                    user,
                    game_id,
                    player_id,
                });

                debugPrinter.printDebug(message);

                const result = await dbEngineMessage.createMessageRow(game_id, player_id, message);

                io.in(game_id)
                    .emit('server-message', result);
            });
        }
    }
}

io.on('connection', initialSocketJoin);
