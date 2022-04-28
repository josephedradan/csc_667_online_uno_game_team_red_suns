const connectionContainer = require('../server/server');
const intermediateGameUno = require('./intermediate_game_uno');

const intermediateSocketIOGameUno = {};
const { io } = connectionContainer;

async function emitInRoomSeverGamePlayers(game_id) {
    const gameWithPlayersRows = await intermediateGameUno.getGameAndTheirPlayersByGameID(game_id);

    io.in(game_id)
        .emit('server-game-players', gameWithPlayersRows);
}

intermediateSocketIOGameUno.emitInRoomSeverGamePlayers = emitInRoomSeverGamePlayers;

async function emitInRoomSeverGameMessage(game_id, messageObject) {
    io.in(game_id)
        .emit('server-game-message', messageObject);
}

intermediateSocketIOGameUno.emitInRoomSeverGameMessage = emitInRoomSeverGameMessage;

// TODO: WARNING, THIS IS NOT RECORDED BY THE SERVER
async function emitInRoomSeverMessage(game_id, messageObject) {
    io.in(game_id)
        .emit('server-message', messageObject);
}

intermediateSocketIOGameUno.emitInRoomSeverMessage = emitInRoomSeverMessage;

module.exports = intermediateSocketIOGameUno;
