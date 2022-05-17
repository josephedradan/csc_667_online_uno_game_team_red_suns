const gameUno = require('./game_uno_logic');
const gameUnoLogicHelper = require('./game_uno_logic_helper');
const debugPrinter = require('../util/debug_printer');
const intermediateSocketIOGameUno = require('./intermediate_socket_io_game_uno');
const dbEngineMessage = require('./db_engine_message');
const dbEngineGameUno = require('./db_engine_game_uno');
const { io } = require('../server/server');
const constants = require('../config/constants');

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

    const game = await gameUno.createGameV2(user_id); // TODO: Possibly redesign because card generation should happen when you start the game, not create a game
    debugPrinter.printBackendBlue(game);

    if (game.status_game_uno === constants.FAILURE) {
        debugPrinter.printError(game);
        return game;
    }

    const game_url = await intermediateGameUno.getRelativeGameURL(game.game.game_id);

    game.game_url = game_url;

    await intermediateSocketIOGameUno.emitInRoom_ServerIndex_Games();

    return game;
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
async function joinGameIfPossibleWrapped(user_id, game_id) {
    debugPrinter.printFunction(joinGameIfPossibleWrapped.name);

    const result = await gameUno.joinGameIfPossible(user_id, game_id);

    if (result.status_game_uno === constants.FAILURE) {
        debugPrinter.printError(result);
    }

    await intermediateSocketIOGameUno.emitInRoom_ServerIndex_Games();

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
async function leaveGameWrapped(user_id, game_id) {
    debugPrinter.printFunction(leaveGameWrapped.name);

    const result = await gameUno.leaveGame(user_id, game_id);

    const arrayPromises = [intermediateSocketIOGameUno.emitInRoom_ServerIndex_Games()];

    if (result.status_game_uno === constants.FAILURE) {
        debugPrinter.printError(result);
    }

    if (result.game) {
        const message = 'The host left, the game is dead, go back to the homepage.';

        arrayPromises.push(intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_MessageServer_Wrapped(
            game_id,
            message,
        ));

        arrayPromises.push(intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_Object(
            game_id,
            {
                status: constants.SUCCESS,
                message,
                url: '/',
            },
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
    await intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_MessageClient(
        game_id,
        messageRow,
    );

    return messageRow;
}

intermediateGameUno.sendMessageWrapped = sendMessageWrapped;

async function moveCardDrawToHandByGameIDAndPlayerRowWrapped(game_id, playerRow) {
    debugPrinter.printFunction(moveCardDrawToHandByGameIDAndPlayerRowWrapped.name);

    const result = await gameUno.moveCardDrawTopToHandFullByGameIDAndPlayerRow(
        game_id,
        playerRow,
        intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_GameState, // Emit the gameState to room and get gameState
        intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_MessageServer_Wrapped,
    );

    if (result.status_game_uno === constants.FAILURE) {
        debugPrinter.printError(result);
    }

    // DO NOT USE
    // await intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_GameState(game_id);

    return result;
}

intermediateGameUno.moveCardDrawToHandByGameIDAndPlayerRowWrapped = moveCardDrawToHandByGameIDAndPlayerRowWrapped;

async function playCardHandToPlayDeckWrapped(user_id, game_id, collection_index, color) {
    debugPrinter.printFunction(playCardHandToPlayDeckWrapped.name);

    const result = await gameUno.moveCardHandToPlayByCollectionIndex(user_id, game_id, collection_index, color);

    if (result.status_game_uno === constants.FAILURE) {
        debugPrinter.printError(result);
    }

    await intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_GameState(game_id);

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
async function startGameWrapped(user_id, game_id) {
    debugPrinter.printFunction(startGameWrapped.name);

    // WARNING: DO NOT RETURN THE RESULT OF THIS FUNCTION TO USERS BECAUSE IT RETURNS EVERYTHING ABOUT THE CARDS
    const result = await gameUno.startGame(
        user_id,
        game_id,
        1,
        7,
        intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_GameState,
    );

    if (result.status_game_uno === constants.FAILURE) {
        debugPrinter.printError(result);
    }

    const resultNew = intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_GameState(game_id);

    return resultNew;
}

intermediateGameUno.startGameWrapped = startGameWrapped;

async function setGamePlayerIDHostWrapped(user_id, game_id) {
    debugPrinter.printFunction(setGamePlayerIDHostWrapped.name);

    const result = await gameUno.setGamePlayerIDHost(user_id, game_id);

    if (result.status_game_uno === constants.FAILURE) {
        return result;
    }

    const playerRow = await dbEngineGameUno.getPlayerRowDetailedByPlayerID(result.player.player_id);

    await intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_MessageServer_Wrapped(game_id, `${playerRow.display_name} is now the host`);

    return result;
}

intermediateGameUno.setGamePlayerIDHostWrapped = setGamePlayerIDHostWrapped;

// TODO: DON'T USE THE BELOW FUNCTION BECAUSE IT IS NOT NECESSARY
// async function setGamePlayerIDTurnWrapped(user_id, game_id) {
//     debugPrinter.printFunction(setGamePlayerIDTurnWrapped.name);
//
//     const result = await gameUno.setGamePlayerIDTurn(user_id, game_id);
//
//     if (result.status_game_uno === constants.FAILURE) {
//         return result;
//     }
//
//     const playerRow = await dbEngineGameUno.getPlayerRowDetailedByPlayerID(result.player.player_id);
//
//     await intermediateSocketIOGameUno.emitInRoomServerGameGameIDMessageServerWrapped(game_id, `It is ${playerRow.display_name}'s turn`);
//
//     return result;
// }
//
// intermediateGameUno.setGamePlayerIDTurnWrapped = setGamePlayerIDTurnWrapped;

async function challengePlayerWrapped(game_id, playerRow) {
    debugPrinter.printFunction(challengePlayerWrapped.name);

    const result = await gameUno.challengePlayer(
        game_id,
        playerRow,
        intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_GameState,
    );

    if (result.status_game_uno === constants.FAILURE) {
        debugPrinter.printError(result);
    }

    // NECESSARY
    await intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_GameState(game_id);

    return result;
}

intermediateGameUno.challengePlayerWrapped = challengePlayerWrapped;

async function callUnoWrapped(user_id, game_id) {
    debugPrinter.printFunction(challengePlayerWrapped.name);

    const result = await gameUno.callUnoLogic(
        user_id,
        game_id,
        intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_GameState,
        intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_MessageServer_Wrapped,
    );

    if (result.status_game_uno === constants.FAILURE) {
        debugPrinter.printError(result);
    }

    await intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_GameState(game_id);

    return result;
}

intermediateGameUno.callUnoWrapped = callUnoWrapped;

module.exports = intermediateGameUno;
