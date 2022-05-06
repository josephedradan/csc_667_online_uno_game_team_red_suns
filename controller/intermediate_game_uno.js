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

    if (gameObject.status === constants.FAILURE) {
        return gameObject;
    }

    const game_url = await intermediateGameUno.getRelativeGameURL(gameObject.game.game_id);

    gameObject.game_url = game_url;

    await intermediateSocketIOGameUno.emitInRoomServerIndexGames();

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

    await intermediateSocketIOGameUno.emitInRoomServerIndexGames();

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

    const arrayPromises = [intermediateSocketIOGameUno.emitInRoomServerIndexGames()];

    if (result.game) {
        arrayPromises.push(intermediateSocketIOGameUno.emitInRoomServerGameGameIDMessageServerWrapped(
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
    await intermediateSocketIOGameUno.emitInRoomServerGameGameIDMessageClient(
        game_id,
        messageRow,
    );

    return messageRow;
}

intermediateGameUno.sendMessageWrapped = sendMessageWrapped;

async function moveCardDrawToHandByGameIDAndPlayerRowWrapped(game_id, playerRow) {
    debugPrinter.printFunction(moveCardDrawToHandByGameIDAndPlayerRowWrapped.name);

    const result = await gameUno.moveCardDrawToHandByGameIDAndPlayerRow(game_id, playerRow);

    debugPrinter.printDebug(result);

    if (result.status === constants.FAILURE) {
        return result;
    }

    // Emit the gameState to room and get gameState
    await intermediateSocketIOGameUno.emitInRoomServerGameGameIDGameState(game_id);

    return result;
}

intermediateGameUno.moveCardDrawToHandByGameIDAndPlayerRowWrapped = moveCardDrawToHandByGameIDAndPlayerRowWrapped;

async function playCardHandToPlayDeckWrapped(game_id, user_id, collection_index) {
    debugPrinter.printFunction(playCardHandToPlayDeckWrapped.name);

    const result = await gameUno.moveCardHandToPlayByGameIDAndUserID(game_id, user_id, collection_index);

    await intermediateSocketIOGameUno.emitInRoomServerGameGameIDGameState(game_id);

    return result;
}

intermediateGameUno.playCardHandToPlayDeckWrapped = playCardHandToPlayDeckWrapped;

/*
Return format
{
    status,
    message,
    game
}
 */
async function startGameWrapped(game_id, user_id) {
    debugPrinter.printFunction(startGameWrapped.name);

    // WARNING: DO NOT RETURN THE RESULT OF THIS FUNCTION TO USERS BECAUSE IT RETURNS EVERYTHING ABOUT THE CARDS
    const result = await gameUno.startGame(game_id, user_id, 1);

    if (result.status === constants.FAILURE) {
        return gameUno.getGameState(game_id);
    }

    // Emit the gameState to room and get gameState
    await intermediateSocketIOGameUno.emitInRoomServerGameGameIDGameState(game_id);

    const rowPlayers = await dbEngineGameUno.getPlayerRowsJoinPlayersRowJoinGameRowByGameID(game_id);

    // eslint-disable-next-line no-restricted-syntax
    for (const rowPlayer of rowPlayers) {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 7; i++) {
            // eslint-disable-next-line no-await-in-loop
            await moveCardDrawToHandByGameIDAndPlayerRowWrapped(game_id, rowPlayer);
        }
    }

    //
    await gameUno.moveCardDrawToPlay(game_id);

    const resultNew = intermediateSocketIOGameUno.emitInRoomServerGameGameIDGameState(game_id);

    return resultNew;
}

intermediateGameUno.startGameWrapped = startGameWrapped;

async function setGamePlayerIDHostWrapped(game_id, user_id) {
    debugPrinter.printFunction(setGamePlayerIDHostWrapped.name);

    const result = await gameUno.setGamePlayerIDHost(game_id, user_id);

    if (result.status === constants.FAILURE) {
        return gameUno.getGameState(game_id);
    }

    await gameUno.moveCardDrawToPlay(game_id);

    const resultNew = intermediateSocketIOGameUno.emitInRoomServerGameGameIDGameState(game_id);

    return resultNew;
}

intermediateGameUno.setGamePlayerIDHostWrapped = setGamePlayerIDHostWrapped;

module.exports = intermediateGameUno;
