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

const controllerGameID = {};

// controllerGameID.initializeDrawStack = async () => {
//     const newDeck = [];
//     const coloredNumCards = await dbEngine.getCardTableOnType('NUMBER');
//     const blackWildCards = await dbEngine.getCardTableOnType('SPECIAL');
// };

async function POSTPlayCard(req, res, next) {
    // TODO: SOCKET HERE

    const {
        card_id,
        lobby_id,
    } = req.body;

    res.json({
        status: 'success',
        message: 'you played a card',
    });
}

controllerGameID.POSTPlayCard = POSTPlayCard;

async function GETDrawCard(req, res, next) {
    // TODO: SOCKET HERE

    res.json({
        status: 'success',
        message: 'you drew a card',
    });
}

controllerGameID.GETDrawCard = GETDrawCard;

async function POSTStartGame(req, res, next) {
    // TODO: SOCKET HERE

    res.json({
        status: 'success',
        message: 'game started',
    });
}

controllerGameID.POSTStartGame = POSTStartGame;

async function GETAllGames(req, res, next) {
    debugPrinter.printMiddleware(GETAllGames.name);

    const result = await dbEngineGameUno.getGameRowsSimple();

    res.json(result);
}

controllerGameID.GETAllGames = GETAllGames;

async function GETAllMessages(req, res, next) {
    debugPrinter.printMiddleware(GETAllMessages.name);

    const result = await dbEngineMessage.getMessageRowsByGameID(req.game.game_id);

    res.json(result);
}

controllerGameID.GETAllMessages = GETAllMessages;

/**
 * Get Info about the current game the user is in
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function GETCurrentGame(req, res, next) {
    debugPrinter.printMiddleware(GETCurrentGame.name);

    const result = await dbEngineGameUno.getGameRowByGameIDSimple(req.game.game_id);
    debugPrinter.printDebug(result);

    res.json(result);
}

controllerGameID.GETCurrentGame = GETCurrentGame;

async function POSTSendMessage(req, res, next) {
    debugPrinter.printMiddleware(POSTSendMessage.name);

    const { message } = req.body;

    const result = await dbEngineMessage.createMessageRow(
        req.game.game_id,
        req.player.player_id,
        message,
    );

    await intermediateSocketIOGameUno.emitInRoomSeverGameGameIDMessageClient(req.game.game_id, result);

    res.json(result);
}

controllerGameID.POSTSendMessage = POSTSendMessage;

async function GETGetHand(req, res, next) {
    debugPrinter.printMiddleware(GETGetHand.name);

    const result = await dbEngineGameUno.getCollectionByPlayerID(req.player.player_id);
    debugPrinter.printDebug(result);

    res.json(result);
}

controllerGameID.GETGetHand = GETGetHand;

async function POSTLeaveGame(req, res, next) {
    debugPrinter.printMiddleware(POSTLeaveGame.name);

    const result = await intermediateGameUno.joinGameWrapped(req.game.game_id, req.user.user_id);

    debugPrinter.printDebug(result);

    res.json(result);
}

controllerGameID.POSTLeaveGame = POSTLeaveGame;
module.exports = controllerGameID;
