const connectionContainer = require('../server/server');
const intermediateGameUno = require('./intermediate_game_uno');
const constants = require('../server/constants');

const intermediateSocketIOGameUno = {};
const { io } = connectionContainer;

async function emitInRoomSeverIndexGames() {
    const gamesWithPlayersRows = await intermediateGameUno.getGamesAndTheirPlayers();

    io.in(constants.socketIDRoomIndex)
        .emit('server-index-games', gamesWithPlayersRows);

    return gamesWithPlayersRows;
}

intermediateSocketIOGameUno.emitInRoomSeverIndexGames = emitInRoomSeverIndexGames;

async function emitInRoomSeverGameGameIDPlayers(game_id) {
    // This may be nuill
    const gameWithPlayersRows = await intermediateGameUno.getGameAndTheirPlayersByGameIDDetailed(game_id);

    io.in(game_id)
        .emit('server-game-game-id-players', gameWithPlayersRows);

    return gameWithPlayersRows;
}

intermediateSocketIOGameUno.emitInRoomSeverGameGameIDPlayers = emitInRoomSeverGameGameIDPlayers;

async function emitInRoomSeverGameGameIDMessageClient(game_id, messageObject) {
    io.in(game_id)
        .emit('server-game-game-id-message-client', messageObject);

    return messageObject;
}

intermediateSocketIOGameUno.emitInRoomSeverGameGameIDMessageClient = emitInRoomSeverGameGameIDMessageClient;

// TODO: WARNING, THIS IS NOT RECORDED BY THE SERVER
async function emitInRoomSeverGameGameIDMessageServer(game_id, messageObject) {
    io.in(game_id)
        .emit('server-game-game-id-message-server', messageObject);

    return messageObject;
}

intermediateSocketIOGameUno.emitInRoomSeverGameGameIDMessageServer = emitInRoomSeverGameGameIDMessageServer;

async function emitInRoomSeverMessage(game_id, messageObject) {
    io.in(game_id)
        .emit('server-message', messageObject);

    return messageObject;
}

intermediateSocketIOGameUno.emitInRoomSeverMessage = emitInRoomSeverMessage;

module.exports = intermediateSocketIOGameUno;
