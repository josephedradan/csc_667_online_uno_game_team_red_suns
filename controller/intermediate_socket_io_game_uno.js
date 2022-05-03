const connectionContainer = require('../server/server');
const gameUno = require('./game_uno');
const constants = require('../server/constants');
const debugPrinter = require('../util/debug_printer');

const intermediateSocketIOGameUno = {};
const { io } = connectionContainer;

async function emitInRoomSeverIndexGames() {
    debugPrinter.printFunction(emitInRoomSeverIndexGames.name);

    const gamesWithPlayersRows = await gameUno.getGamesAndTheirPlayers();

    io.in(constants.socketIDRoomIndex)
        .emit('server-index-games', gamesWithPlayersRows);

    return gamesWithPlayersRows;
}

intermediateSocketIOGameUno.emitInRoomSeverIndexGames = emitInRoomSeverIndexGames;

async function emitInRoomSeverGameGameIDPlayers(game_id) {
    debugPrinter.printFunction(emitInRoomSeverGameGameIDPlayers.name);

    // This may be null
    const gameWithPlayersRows = await gameUno.getGameAndTheirPlayersByGameIDDetailed(game_id);

    io.in(game_id)
        .emit('server-game-game-id-players', gameWithPlayersRows);

    return gameWithPlayersRows;
}

intermediateSocketIOGameUno.emitInRoomSeverGameGameIDPlayers = emitInRoomSeverGameGameIDPlayers;

/*

{
    message_id,
    game_id,
    player_id,
    message,
    time_stamp,

}
 */
async function emitInRoomSeverGameGameIDMessageClient(game_id, messageObject) {
    debugPrinter.printFunction(emitInRoomSeverGameGameIDMessageClient.name);

    io.in(game_id)
        .emit('server-game-game-id-message-client', messageObject);

    return messageObject;
}

intermediateSocketIOGameUno.emitInRoomSeverGameGameIDMessageClient = emitInRoomSeverGameGameIDMessageClient;

/*

{
    display_name,
    massage,
}
 */
// TODO: WARNING, THIS IS NOT RECORDED BY THE SERVER
async function emitInRoomSeverGameGameIDMessageServer(game_id, messageObject) {
    debugPrinter.printFunction(emitInRoomSeverGameGameIDMessageServer.name);

    io.in(game_id)
        .emit('server-game-game-id-message-server', messageObject);

    return messageObject;
}

intermediateSocketIOGameUno.emitInRoomSeverGameGameIDMessageServer = emitInRoomSeverGameGameIDMessageServer;

async function emitInRoomSeverGameGameIDMessageServerWrapped(game_id, message) {
    debugPrinter.printFunction(emitInRoomSeverGameGameIDMessageServer.name);

    return emitInRoomSeverGameGameIDMessageServer(
        game_id,
        {
            display_name: 'Server',
            message,
        },
    );
}

intermediateSocketIOGameUno.emitInRoomSeverGameGameIDMessageServerWrapped = emitInRoomSeverGameGameIDMessageServerWrapped;

async function emitInRoomSeverMessage(game_id, messageObject) {
    debugPrinter.printFunction(emitInRoomSeverMessage.name);

    io.in(game_id)
        .emit('server-message', messageObject);

    return messageObject;
}

intermediateSocketIOGameUno.emitInRoomSeverMessage = emitInRoomSeverMessage;

async function emitInRoomSeverGameGameIDGameState(game_id) {
    debugPrinter.printFunction(emitInRoomSeverGameGameIDGameState.name);

    const gameState = await gameUno.getGameState(game_id);

    io.in(game_id)
        .emit('server-game-game-id-game-state', gameState);

    return gameState;
}

intermediateSocketIOGameUno.emitInRoomSeverGameGameIDGameState = emitInRoomSeverGameGameIDGameState;

module.exports = intermediateSocketIOGameUno;
