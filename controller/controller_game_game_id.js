/*
Handle all the game api calls

 */
const intermediateGameUno = require('./intermediate_game_uno');

const handlerGameUno = require('./handler_game_uno');

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

// async function POSTJoinGameIfPossible(req, res, next) {
//     debugPrinter.printMiddleware(POSTJoinGameIfPossible.name);
//     // TODO FIX THIS BY LIMITING AMOUNT OF PLAYERS
//     // TODO CAN PASSWORD PROTECT JOING GAME IF USING POST
//
//     // Is the game active (game is being played)
//     if (await intermediateGameUno.checkIfGameIsActive(req.game.game_id)) {
//         res.json({
//             status: 'failure',
//             message: 'Game is active',
//             url: handlerGameUno.getRelativeGameURL(req.game.game_id),
//         });
//
//         return;
//     }
//
//     // Get player of the user if the user is a player in the game already
//     const player = await dbEngineGameUno.getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID(req.game.game_id, req.user.user_id);
//
//     // User is not a player in the game
//     if (!player) {
//         const x = await intermediateGameUno.joinGame(req.game.game_id, req.user.user_id);
//         debugPrinter.printDebug(`PLAYER HAS JOINED GAME: ${req.game.game_id}`);
//         debugPrinter.printDebug(x);
//
//         res.json({
//             status: 'success',
//             message: 'you have joined the game',
//             url: handlerGameUno.getRelativeGameURL(req.game.game_id),
//         });
//     }
//
//     res.json({
//         status: 'failure',
//         message: 'You are already a player in the game',
//         url: handlerGameUno.getRelativeGameURL(req.game.game_id),
//
//     });
// }

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

    const result = await dbEngineGameUno.getGameRows();

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

    const result = await dbEngineGameUno.getGameRowByGameID(req.game.game_id);
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
    // debugPrinter.printBackendRed(result)
    await intermediateSocketIOGameUno.emitInRoomSeverGameMessage(req.game.game_id, result);

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

module.exports = controllerGameID;
