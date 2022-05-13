const connectionContainer = require('../server/server');
const gameUno = require('./game_uno_logic');
const constants = require('../config/constants');
const debugPrinter = require('../util/debug_printer');

const intermediateSocketIOGameUno = {};
const { io } = connectionContainer;

async function emitInRoom_ServerIndex_Games() {
    debugPrinter.printFunction(emitInRoom_ServerIndex_Games.name);

    const result = await gameUno.getGamesWithTheirPlayersSimple();

    io.in(constants.socketIDRoomIndex)
        .emit('server-index-games', result.games);

    return result;
}

intermediateSocketIOGameUno.emitInRoom_ServerIndex_Games = emitInRoom_ServerIndex_Games;

async function emitInRoom_ServerGameGameID_Players(game_id) {
    debugPrinter.printFunction(emitInRoom_ServerGameGameID_Players.name);

    // This may be null
    const gameWithPlayersRows = await gameUno.getGameAndTheirPlayersByGameIDDetailed(game_id);

    io.in(game_id)
        .emit('server-game-game-id-players', gameWithPlayersRows);

    return gameWithPlayersRows;
}

intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_Players = emitInRoom_ServerGameGameID_Players;

/*

{
    message_id,
    game_id,
    player_id,
    message,
    time_stamp,

}
 */
async function emitInRoom_ServerGameGameID_MessageClient(game_id, messageObject) {
    debugPrinter.printFunction(emitInRoom_ServerGameGameID_MessageClient.name);

    io.in(game_id)
        .emit('server-game-game-id-message-client', messageObject);

    return messageObject;
}

intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_MessageClient = emitInRoom_ServerGameGameID_MessageClient;

/*

{
    display_name,
    massage,
}
 */
// TODO: WARNING, THIS IS NOT RECORDED BY THE SERVER
async function emitInRoom_ServerGameGameID_MessageServer(game_id, messageObject) {
    debugPrinter.printFunction(emitInRoom_ServerGameGameID_MessageServer.name);

    io.in(game_id)
        .emit('server-game-game-id-message-server', messageObject);

    return messageObject;
}

intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_MessageServer = emitInRoom_ServerGameGameID_MessageServer;

async function emitInRoom_ServerGameGameID_MessageServer_Wrapped(game_id, message) {
    debugPrinter.printFunction(emitInRoom_ServerGameGameID_MessageServer_Wrapped.name);

    return emitInRoom_ServerGameGameID_MessageServer(
        game_id,
        {
            display_name: 'Server',
            message,
        },
    );
}

intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_MessageServer_Wrapped = emitInRoom_ServerGameGameID_MessageServer_Wrapped;

async function emitInRoom_ServerMessage(game_id, messageObject) {
    debugPrinter.printFunction(emitInRoom_ServerMessage.name);

    io.in(game_id)
        .emit('server-message', messageObject);

    return messageObject;
}

intermediateSocketIOGameUno.emitInRoom_ServerMessage = emitInRoom_ServerMessage;

async function emitInRoom_ServerGameGameID_GameState(game_id) {
    debugPrinter.printFunction(emitInRoom_ServerGameGameID_GameState.name);

    const gameState = await gameUno.getGameState(game_id);

    io.in(game_id)
        .emit('server-game-game-id-game-state', gameState);

    return gameState;
}

intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_GameState = emitInRoom_ServerGameGameID_GameState;

async function emitInRoom_ServerGameGameID_Object(game_id, object) {
    debugPrinter.printFunction(emitInRoom_ServerGameGameID_Object.name);

    io.in(game_id)
        .emit('server-game-game-id-object', object);

    return object;
}

intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_Object = emitInRoom_ServerGameGameID_Object;

module.exports = intermediateSocketIOGameUno;
