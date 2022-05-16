/*
Handle all the game api calls

 */
const gameUno = require('./game_uno_logic');

const intermediateGameUno = require('./intermediate_game_uno');

const connectionContainer = require('../server/server');

const { io } = connectionContainer;

const dbEngine = require('./db_engine');
const dbEngineGameUno = require('./db_engine_game_uno');

const utilCommon = require('./util_common');

const debugPrinter = require('../util/debug_printer');
const dbEngineMessage = require('./db_engine_message');
const intermediateSocketIOGameUno = require('./intermediate_socket_io_game_uno');
const db = require('../db');
const constants = require('../config/constants');

const controllerGameID = {};

async function POSTPlayCard(req, res, next) {
    debugPrinter.printMiddleware(POSTPlayCard.name);

    /* LOOK AT MIGRATION
    * req.user
      req.game
      req.player
    */
    const {
        collection_index, // TODO DO VALIDATION
        // type,
        // content,
        color,
    } = req.body;

    const result = await intermediateGameUno.playCardHandToPlayDeckWrapped(
        req.user.user_id,
        req.game.game_id,
        collection_index,
        color,
    );

    debugPrinter.printRed(result);

    // debugPrinter.printDebug(result);

    res.json(result);
}

controllerGameID.POSTPlayCard = POSTPlayCard;

async function GETDrawCard(req, res, next) {
    debugPrinter.printMiddleware(GETDrawCard.name);

    const result = await intermediateGameUno.moveCardDrawToHandByGameIDAndPlayerRowWrapped(req.game.game_id, req.player);

    // const result = await dbEngineGameUno.getCollectionRowDetailedByPlayerID(req.player.player_id);

    debugPrinter.printBackendWhite(result);

    res.json(result);
}

controllerGameID.GETDrawCard = GETDrawCard;

async function POSTStartGame(req, res, next) {
    debugPrinter.printMiddleware(POSTStartGame.name);

    const result = await intermediateGameUno.startGameWrapped(req.user.user_id, req.game.game_id);

    // debugPrinter.printBackendWhite(result);

    res.json(result);
}

controllerGameID.POSTStartGame = POSTStartGame;

async function POSTLeaveGame(req, res, next) {
    debugPrinter.printMiddleware(POSTLeaveGame.name);

    const result = await intermediateGameUno.leaveGameWrapped(req.user.user_id, req.game.game_id);

    // debugPrinter.printBackendWhite(result);

    res.json(result);
}

controllerGameID.POSTLeaveGame = POSTLeaveGame;

async function POSTTransferHost(req, res, next) { // TODO THIS
    debugPrinter.printMiddleware(POSTLeaveGame.name);

    // Give user_id to transfer host
    const { user_id } = req.body;

    const result = await intermediateGameUno.setGamePlayerIDHostWrapped(user_id, req.game.game_id);

    debugPrinter.printDebug(result);

    res.json(result);
}

controllerGameID.POSTTransferHost = POSTTransferHost;

async function GETGetMessages(req, res, next) {
    debugPrinter.printMiddleware(GETGetMessages.name);

    const messageRows = await dbEngineMessage.getMessageRowsByGameID(req.game.game_id);

    res.json(messageRows);
}

controllerGameID.GETGetMessages = GETGetMessages;

/**
 * Get Info about the current game the user is in
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function GETGetGameState(req, res, next) {
    debugPrinter.printMiddleware(GETGetGameState.name);

    const result = await gameUno.getGameState(req.game.game_id);

    // debugPrinter.printBackendWhite(result);

    res.json(result);
}

controllerGameID.GETGetGameState = GETGetGameState;

async function POSTSendMessage(req, res, next) {
    debugPrinter.printMiddleware(POSTSendMessage.name);

    const { message } = req.body; // TODO NO VALIDATION BY THE WAY

    const messageRow = await intermediateGameUno.sendMessageWrapped(
        req.game.game_id,
        req.player.player_id,
        message,
    );

    res.json(messageRow);
}

controllerGameID.POSTSendMessage = POSTSendMessage;

async function GETGetHand(req, res, next) {
    debugPrinter.printMiddleware(GETGetHand.name);

    const result = await gameUno.getHand(req.user.user_id, req.game.game_id);

    // debugPrinter.printBackendWhite(result);

    res.json(result);
}

controllerGameID.GETGetHand = GETGetHand;

async function GETGetGameAndTheirPlayers(req, res, next) {
    debugPrinter.printMiddleware(GETGetGameAndTheirPlayers.name);

    const result = await gameUno.getGameAndTheirPlayersByGameIDDetailed(req.game.game_id);

    // debugPrinter.printBackendWhite(result);

    res.json(result);
}

controllerGameID.GETGetGameAndTheirPlayers = GETGetGameAndTheirPlayers;

async function GETGetPlayer(req, res, next) {
    debugPrinter.printMiddleware(GETGetPlayer.name);

    const result = await gameUno.getPlayerDetailedByGameIDAndUserID(req.user.user_id, req.game.game_id);

    res.json(result);
}

controllerGameID.GETGetPlayer = GETGetPlayer;

async function POSTUno(req, res, next) {
    debugPrinter.printMiddleware(POSTUno.name);

    // TODO: emit to the socket with a wrapper????
    const result = await intermediateGameUno.callUnoWrapped(req.user.user_id, req.game.game_id);

    debugPrinter.printError(result);

    res.json(result);
}

controllerGameID.POSTUno = POSTUno;

async function POSTChallenge(req, res, next) {
    debugPrinter.printMiddleware(POSTChallenge.name);

    const result = await intermediateGameUno.challengePlayerWrapped(
        req.game.game_id,
        req.player,
    );

    res.json(result);
}

controllerGameID.POSTChallenge = POSTChallenge;

module.exports = controllerGameID;
