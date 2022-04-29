const connectionContainer = require('../server/server');
const intermediateGameUno = require('./intermediate_game_uno');

const intermediateSocketIOGameUno = {};
const { io } = connectionContainer;

async function emitInRoomSeverGamePlayers(game_id) {
    const gameWithPlayersRows = await intermediateGameUno.getGameAndTheirPlayersByGameIDDetailed(game_id);

    io.in(game_id)
        .emit('server-game-players', gameWithPlayersRows);

    return gameWithPlayersRows;
}

intermediateSocketIOGameUno.emitInRoomSeverGamePlayers = emitInRoomSeverGamePlayers;

async function emitInRoomSeverGameMessageClient(game_id, messageObject) {
    io.in(game_id)
        .emit('server-game-message-client', messageObject);

    return messageObject;
}

intermediateSocketIOGameUno.emitInRoomSeverGameMessageClient = emitInRoomSeverGameMessageClient;

// TODO: WARNING, THIS IS NOT RECORDED BY THE SERVER
async function emitInRoomSeverGameMessageServer(game_id, messageObject) {
    io.in(game_id)
        .emit('server-game-message-server', messageObject);

    return messageObject;
}

intermediateSocketIOGameUno.emitInRoomSeverGameMessageServer = emitInRoomSeverGameMessageServer;

async function emitInRoomSeverMessage(game_id, messageObject) {
    io.in(game_id)
        .emit('server-message', messageObject);

    return messageObject;
}

intermediateSocketIOGameUno.emitInRoomSeverMessage = emitInRoomSeverMessage;

module.exports = intermediateSocketIOGameUno;
