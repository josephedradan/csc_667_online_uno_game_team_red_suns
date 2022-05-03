const gameUno = require('./game_uno');
const debugPrinter = require('../util/debug_printer');
const intermediateSocketIOGameUno = require('./intermediate_socket_io_game_uno');
const dbEngineMessage = require('./db_engine_message');
const dbEngineGameUno = require('./db_engine_game_uno');

const intermediateGameUno = {};

async function getRelativeGameURL(game_id) {
    return `/game/${game_id}`;
}

intermediateGameUno.getRelativeGameURL = getRelativeGameURL;

/*
Return format
{
    player,
    game,
    players,
    cardStateRows,
    game_url,
}
 */
/**
 * Intermediate function creates the uno game while also append the game url to the result
 *
 * Notes:
 *      This function was created so that req.json and res.redirect/res.render could share code
 *
 * @param user_id
 * @returns {Promise<void>}
 */
async function createGameWrapped(user_id) {
    debugPrinter.printFunction(createGameWrapped.name);

    const gameObject = await gameUno.createGameV2(user_id, 2);
    debugPrinter.printBackendBlue(gameObject);

    // If nothing returned
    if (!gameObject) {
        return null;
    }

    const game_url = await intermediateGameUno.getRelativeGameURL(gameObject.game.game_id);

    debugPrinter.printBackendGreen(game_url);

    gameObject.game_url = game_url;

    await Promise.all([
        intermediateSocketIOGameUno.emitInRoomSeverIndexGames(),
    ]);

    return gameObject;
}

intermediateGameUno.createGameWrapped = createGameWrapped;

/*
Return format
{
    status
    message
    player
{
 */
async function joinGameWrapped(game_id, user_id) {
    debugPrinter.printFunction(joinGameWrapped.name);

    const result = await gameUno.joinGame(game_id, user_id);
    debugPrinter.printRed(result);

    await Promise.all([
        intermediateSocketIOGameUno.emitInRoomSeverIndexGames(),
    ]);

    return result;
}

intermediateGameUno.joinGameWrapped = joinGameWrapped;

/*
Return format
{
    status
    message
    player
{
 */
async function leaveGameWrapped(game_id, user_id) {
    debugPrinter.printFunction(leaveGameWrapped.name);

    const result = await gameUno.leaveGame(game_id, user_id);

    await Promise.all([
        // intermediateSocketIOGameUno.emitInRoomSeverGameGameIDMessageServer(game_id, )
        intermediateSocketIOGameUno.emitInRoomSeverIndexGames(),
    ]);

    return result;
}

intermediateGameUno.leaveGameWrapped = leaveGameWrapped;

/*
    player_id,
    message_id,
    time_stamp_,
    message,
    display_name,
    game_id

 */
async function sendMessageWrapped(game_id, player_id, message) {
    debugPrinter.printFunction(sendMessageWrapped.name);

    const messageRow = await dbEngineMessage.createMessageRow(
        game_id,
        player_id,
        message,
    );

    // Emit client message to everyone in the room
    await intermediateSocketIOGameUno.emitInRoomSeverGameGameIDMessageClient(
        game_id,
        messageRow,
    );

    return messageRow;
}

intermediateGameUno.sendMessageWrapped = sendMessageWrapped;

async function startGameWrapped(game_id, player_id) {
    const gameRow = await dbEngineGameUno.getGameRowByGameIDDetailed(game_id);

    // If player_id is host and if game is not active, make it active
    if (gameRow.plyer_id_host === player_id && gameRow.is_active === false) {
        await dbEngineGameUno.updateGameIsActiveByGameID(game_id, true);
    }

    // TODO GET THE CARDS


    // Emit the gameState to room and get gameState
    const gameState = await intermediateSocketIOGameUno.emitInRoomSeverGameGameIDGameState(game_id);

    return gameState;
}

intermediateGameUno.startGameWrapped = startGameWrapped;

module.exports = intermediateGameUno;
