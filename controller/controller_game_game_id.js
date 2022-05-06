/*
Handle all the game api calls

 */
const gameUno = require('./game_uno');

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
const constants = require('../server/constants');

const controllerGameID = {};

// controllerGameID.initializeDrawStack = async () => {
//     const newDeck = [];
//     const coloredNumCards = await dbEngine.getCardTableOnType('NUMBER');
//     const blackWildCards = await dbEngine.getCardTableOnType('SPECIAL');
// };

async function POSTPlayCard(req, res, next) {
    // TODO: SOCKET HERE

    /* LOOK AT MIGRATION
    * req.user
      req.game
      req.player
    */
    debugPrinter.printMiddleware(POSTPlayCard.name);
    const {
        collection_index,
    } = req.body;

    const result = await intermediateGameUno.playCardHandToPlayDeckWrapped(req.game.game_id, collection_index, req.player.player_id);

    debugPrinter.printDebug(result);

    res.json(result);
}

controllerGameID.POSTPlayCard = POSTPlayCard;

async function GETDrawCard(req, res, next) {
    debugPrinter.printMiddleware(GETDrawCard.name);

    await intermediateGameUno.moveCardDrawToHandByGameIDAndPlayerIDWrapped(req.game.game_id, req.player.player_id);

    const result = await dbEngineGameUno.getCollectionRowByPlayerID(req.player.player_id);

    debugPrinter.printDebug(result);

    res.json(result);
}

controllerGameID.GETDrawCard = GETDrawCard;

async function POSTStartGame(req, res, next) {
    debugPrinter.printMiddleware(POSTStartGame.name);

    const result = await intermediateGameUno.startGameWrapped(req.game.game_id, req.player.player_id);

    debugPrinter.printDebug(result);

    res.json(result);
}

controllerGameID.POSTStartGame = POSTStartGame;

async function POSTLeaveGame(req, res, next) {
    debugPrinter.printMiddleware(POSTLeaveGame.name);

    const result = await intermediateGameUno.leaveGameWrapped(req.game.game_id, req.user.user_id);

    debugPrinter.printDebug(result);

    res.json(result);
}

controllerGameID.POSTLeaveGame = POSTLeaveGame;

async function POSTTransferHost(req, res, next) { // TODO THIS
    debugPrinter.printMiddleware(POSTLeaveGame.name);

    // const result = await intermediateGameUno.leaveGameWrapped(req.game.game_id, req.user.user_id);
    //
    // debugPrinter.printDebug(result);

    res.json('TODO');
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
async function GETGameState(req, res, next) {
    debugPrinter.printMiddleware(GETGameState.name);

    const result = await gameUno.getGameState(req.game.game_id);

    debugPrinter.printDebug(result);

    res.json(result);
}

controllerGameID.GETGameState = GETGameState;

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

    const result = await gameUno.getHand(req.player.player_id);

    debugPrinter.printDebug(result);

    res.json(result);
}

controllerGameID.GETGetHand = GETGetHand;

async function GETGetGameAndTheirPlayers(req, res, next) {
    debugPrinter.printMiddleware(GETGetGameAndTheirPlayers.name);

    const result = await gameUno.getGameAndTheirPlayersByGameIDDetailed(req.game.game_id);

    debugPrinter.printDebug(result);

    res.json(result);
}

controllerGameID.GETGetGameAndTheirPlayers = GETGetGameAndTheirPlayers;

async function GETGetPlayer(req, res, next) {
    debugPrinter.printMiddleware(GETGetPlayer.name);

    const result = await gameUno.getPlayerDetailed(req.game.game_id, req.player.player_id);

    debugPrinter.printDebug(result);

    res.json(result);
}

controllerGameID.GETGetPlayer = GETGetPlayer;

module.exports = controllerGameID;
