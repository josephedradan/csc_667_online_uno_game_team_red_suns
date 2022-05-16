/*

 */

const connectionContainer = require('../server/server');

const { io } = connectionContainer;

const debugPrinter = require('../util/debug_printer');
const dbEngineMessage = require('./db_engine_message');
const dbEngineGameUno = require('./db_engine_game_uno');
const intermediateSocketIOGameUno = require('./intermediate_socket_io_game_uno');
const gameUno = require('./game_uno_logic');
const constants = require('../config/constants');
const intermediateGameUno = require('./intermediate_game_uno');

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

/*
IMPORTANT NOTES:
    WHEN USING socket.request FOR STUFF RELATED TO THE USER, GAME, OR PLAYER
    USE .user_id, .game_id, and .player_id AND MAKE DB CALLS BECAUSE INFORMATION
    STORED ON THE SOCKET MIGHT BE OUT OF DATE.

 */
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

        // TODO MOVE THIS
        // Join socket to a room (THIS SHOULD BE CALLED ONCE EVERY TIME A USER IS DIRECTED TO A GAME)
        socket.on('client-game-game-id-join-room', async (game_id_client) => {
            debugPrinter.printBackendMagenta('client-game-game-id-join-room');
            debugPrinter.printSuccess(game_id_client);
            debugPrinter.printSuccess(typeof (game_id_client));

            if (game_id_client) {
                socket.join(game_id_client);

                // Assign game_id to socket.request.game_id
                // eslint-disable-next-line no-param-reassign
                socket.request.game_id = game_id_client;

                const playerRow = await dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID(
                    socket.request.user.user_id,
                    socket.request.game_id,
                );

                // If Player Row exists
                if (playerRow) {
                    // debugPrinter.printBackendRed(playerRow);

                    // Assign player_id to socket.request.player_id
                    // eslint-disable-next-line no-param-reassign
                    socket.request.player_id = playerRow.player_id;

                    const user_recent = await dbEngineGameUno.getUserRowByPlayerID(playerRow.player_id);

                    await Promise.all(
                        [
                            intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_MessageServer_Wrapped(
                                socket.request.game_id,
                                `${user_recent.display_name} has joined.`,
                            ),
                            intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_Players(socket.request.game_id),
                        ],
                    );
                }
            } else {
                debugPrinter.printDebug(`${user.display_name} gave a and invalid game_id: ${game_id_client}`);
            }
        });

        // If the user is a player in the game and disconnects         // TODO MOVE THIS
        socket.on('disconnect', async (reason) => {
            debugPrinter.printRed('DISCONNECT');

            // If socket has the game_id and socket has the player_id
            if (socket.request.game_id && socket.request.player_id) {
                // get user
                const user_recent = await dbEngineGameUno.getUserRowByPlayerID(socket.request.player_id);

                // get game
                const game_current = await dbEngineGameUno.getGameRowDetailedByGameID(socket.request.game_id);

                // If user exists and game exists
                if (user_recent && game_current) {
                    let emitInRoomServerMessage;

                    // If the game is active, then the player can rejoin
                    if (game_current.is_active) {
                        emitInRoomServerMessage = intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_MessageServer_Wrapped(
                            socket.request.game_id,
                            `${user_recent.display_name} has left (They can rejoin).`,

                        );
                    } else {
                        // Make the player leave the game
                        await intermediateGameUno.leaveGameWrapped(
                            socket.request.user.user_id,
                            socket.request.game_id,
                        );

                        emitInRoomServerMessage = intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_MessageServer_Wrapped(
                            socket.request.game_id,
                            `${user_recent.display_name} has left.`,

                        );
                    }

                    await Promise.all(
                        [
                            emitInRoomServerMessage,
                            intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_Players(socket.request.game_id),
                        ],
                    );
                }
            }
        });
    }

    // Join the index room if emitted by the client
    socket.on('client-index-join-room', async () => {
        debugPrinter.printBackendMagenta('client-index-join-room');
        socket.join(constants.socketIDRoomIndex);
    });
}

io.on('connection', initialSocketJoin);
