const connectionContainer = require('../server/server');
const gameUno = require('./game_uno');
const constants = require('../server/constants');
const debugPrinter = require('../util/debug_printer');

const intermediateSocketIOGameUno = {};
const { io } = connectionContainer;

async function emitInRoomServerIndexGames() {
    debugPrinter.printFunction(emitInRoomServerIndexGames.name);

    const result = await gameUno.getGamesWithTheirPlayersSimple();

    io.in(constants.socketIDRoomIndex)
        .emit('server-index-games', result.games);

    return result;
}

intermediateSocketIOGameUno.emitInRoomServerIndexGames = emitInRoomServerIndexGames;

async function emitInRoomServerGameGameIDPlayers(game_id) {
    debugPrinter.printFunction(emitInRoomServerGameGameIDPlayers.name);

    // This may be null
    const gameWithPlayersRows = await gameUno.getGameAndTheirPlayersByGameIDDetailed(game_id);

    io.in(game_id)
        .emit('server-game-game-id-players', gameWithPlayersRows);

    return gameWithPlayersRows;
}

intermediateSocketIOGameUno.emitInRoomServerGameGameIDPlayers = emitInRoomServerGameGameIDPlayers;

/*

{
    message_id,
    game_id,
    player_id,
    message,
    time_stamp,

}
 */
async function emitInRoomServerGameGameIDMessageClient(game_id, messageObject) {
    debugPrinter.printFunction(emitInRoomServerGameGameIDMessageClient.name);

    io.in(game_id)
        .emit('server-game-game-id-message-client', messageObject);

    return messageObject;
}

intermediateSocketIOGameUno.emitInRoomServerGameGameIDMessageClient = emitInRoomServerGameGameIDMessageClient;

/*

{
    display_name,
    massage,
}
 */
// TODO: WARNING, THIS IS NOT RECORDED BY THE SERVER
async function emitInRoomServerGameGameIDMessageServer(game_id, messageObject) {
    debugPrinter.printFunction(emitInRoomServerGameGameIDMessageServer.name);

    io.in(game_id)
        .emit('server-game-game-id-message-server', messageObject);

    return messageObject;
}

intermediateSocketIOGameUno.emitInRoomServerGameGameIDMessageServer = emitInRoomServerGameGameIDMessageServer;

async function emitInRoomServerGameGameIDMessageServerWrapped(game_id, message) {
    debugPrinter.printFunction(emitInRoomServerGameGameIDMessageServer.name);

    return emitInRoomServerGameGameIDMessageServer(
        game_id,
        {
            display_name: 'Server',
            message,
        },
    );
}

intermediateSocketIOGameUno.emitInRoomServerGameGameIDMessageServerWrapped = emitInRoomServerGameGameIDMessageServerWrapped;

async function emitInRoomServerMessage(game_id, messageObject) {
    debugPrinter.printFunction(emitInRoomServerMessage.name);

    io.in(game_id)
        .emit('server-message', messageObject);

    return messageObject;
}

intermediateSocketIOGameUno.emitInRoomServerMessage = emitInRoomServerMessage;

async function emitInRoomServerGameGameIDGameState(game_id) {
    debugPrinter.printFunction(emitInRoomServerGameGameIDGameState.name);

    const gameState = await gameUno.getGameState(game_id);

    io.in(game_id)
        .emit('server-game-game-id-game-state', gameState);

    return gameState;
}

intermediateSocketIOGameUno.emitInRoomServerGameGameIDGameState = emitInRoomServerGameGameIDGameState;

module.exports = intermediateSocketIOGameUno;
