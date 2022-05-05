const gameUno = require('./game_uno');
const debugPrinter = require('../util/debug_printer');
const intermediateSocketIOGameUno = require('./intermediate_socket_io_game_uno');
const dbEngineMessage = require('./db_engine_message');
const dbEngineGameUno = require('./db_engine_game_uno');
const { io } = require('../server/server');
const constants = require('../server/constants');

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
    cardRows,
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

    const gameObject = await gameUno.createGameV2(user_id); // TODO: Possibly redesign because card generation should happen when you start the game, not create a game
    debugPrinter.printBackendBlue(gameObject);

    // If nothing returned
    if (gameObject.status === constants.FAILURE) {
        return gameObject;
    }

    const game_url = await intermediateGameUno.getRelativeGameURL(
        gameObject.game.game_id,
    );

    debugPrinter.printBackendGreen(game_url);

    gameObject.game_url = game_url;

    await intermediateSocketIOGameUno.emitInRoomSeverIndexGames();

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
async function joinGameIfPossibleWrapped(game_id, user_id) {
    debugPrinter.printFunction(joinGameIfPossibleWrapped.name);

    const result = await gameUno.joinGameIfPossible(game_id, user_id);

    debugPrinter.printDebug(result);

    await intermediateSocketIOGameUno.emitInRoomSeverIndexGames();

    return result;
}

intermediateGameUno.joinGameIfPossibleWrapped = joinGameIfPossibleWrapped;

/*
Return format
{
    status
    message
    player
    game
{
 */
async function leaveGameWrapped(game_id, user_id) {
    debugPrinter.printFunction(leaveGameWrapped.name);

    const result = await gameUno.leaveGame(game_id, user_id);

    const arrayPromises = [intermediateSocketIOGameUno.emitInRoomSeverIndexGames()];

    if (result.game) {
        arrayPromises.push(intermediateSocketIOGameUno.emitInRoomSeverGameGameIDMessageServerWrapped(
            game_id,
            'The host left, the game is dead, go back to the homepage.',
        ));
    }

    await Promise.all(arrayPromises);

    return result;
}

intermediateGameUno.leaveGameWrapped = leaveGameWrapped;

/*
Return format
{
    player_id,
    message_id,
    time_stamp_,
    message,
    display_name,
    game_id
}
 */
async function sendMessageWrapped(game_id, player_id, message) {
    debugPrinter.printFunction(sendMessageWrapped.name);

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

async function moveCardDrawToHandWrapped(game_id, player_id) {
    debugPrinter.printFunction(moveCardDrawToHandWrapped.name);

    const result = await gameUno.moveCardDrawToHand(game_id, player_id);

    // TODO GUARD
    debugPrinter.printDebug(result)

    // Emit the gameState to room and get gameState
    await intermediateSocketIOGameUno.emitInRoomSeverGameGameIDGameState(
        game_id,
    );

    return result;
}

intermediateGameUno.moveCardDrawToHandWrapped = moveCardDrawToHandWrapped;

async function playCardHandToPlayDeckWrapped(game_id, collection_index, player_id) {
    debugPrinter.printFunction(playCardHandToPlayDeckWrapped.name);

    const result = await gameUno.moveCardHandToPlay(game_id, collection_index, player_id);

    await intermediateSocketIOGameUno.emitInRoomSeverGameGameIDGameState(
        game_id,
    );

    return result;
}

intermediateGameUno.playCardHandToPlayDeck = playCardHandToPlayDeckWrapped;
/*
Return format
{
    status,
    message,
    game
}
 */
async function startGameWrapped(game_id, player_id) {
    debugPrinter.printFunction(startGameWrapped.name);

    const result = await gameUno.startGame(game_id, player_id, 1);

    if (result.status === constants.FAILURE) {
        debugPrinter.printError(result)
        return result;
    }

    // Emit the gameState to room and get gameState
    await intermediateSocketIOGameUno.emitInRoomSeverGameGameIDGameState();

    const rowPlayers = await dbEngineGameUno.getPlayerRowsJoinPlayersRowJoinGameRowByGameID(game_id);

    // eslint-disable-next-line no-restricted-syntax
    for (const rowPlayer of rowPlayers) {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 7; i++) {
            // eslint-disable-next-line no-await-in-loop
            await moveCardDrawToHandWrapped(game_id, rowPlayer.player_id);
            debugPrinter.printError("FUCK")
        }
    }

    await Promise.all([
        gameUno.moveCardDrawToPlay(game_id),
        intermediateSocketIOGameUno.emitInRoomSeverGameGameIDGameState(),
    ]);

    return result;
}

intermediateGameUno.startGameWrapped = startGameWrapped;

module.exports = intermediateGameUno;
