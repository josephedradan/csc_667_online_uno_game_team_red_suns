/*
Handle all the game api calls

 */
const logicGameUno = require('./logic_game_uno');

const handlerGameUno = require('./handler_game_uno');

const connectionContainer = require('../server/server');

const { io } = connectionContainer;

const dbEngine = require('./db_engine');
const dbEngineGameUno = require('./db_engine_game_uno');

const utilCommon = require('../util/util_common');

const debugPrinter = require('../util/debug_printer');
const dbEngineMessage = require('./db_engine_message');

const controllerGameAPI = {};

// controllerGameAPI.initializeDrawStack = async () => {
//     const newDeck = [];
//     const coloredNumCards = await dbEngine.getCardTableOnType('NUMBER');
//     const blackWildCards = await dbEngine.getCardTableOnType('SPECIAL');
// };

async function POSTPlayCard(req, res, next) {
    // TODO: SOCKET HERE

    const { card_id, lobby_id } = req.body;

    res.json({
        status: 'success',
        message: 'you played a card',
    });
}

controllerGameAPI.POSTPlayCard = POSTPlayCard;

async function GETDrawCard(req, res, next) {
    // TODO: SOCKET HERE

    res.json({
        status: 'success',
        message: 'you drew a card',
    });
}

controllerGameAPI.GETDrawCard = GETDrawCard;

async function POSTStartGame(req, res, next) {
    // TODO: SOCKET HERE

    res.json({
        status: 'success',
        message: 'game started',
    });
}

controllerGameAPI.POSTStartGame = POSTStartGame;

async function GETAllGames(req, res, next) {
    debugPrinter.printMiddleware(GETAllGames.name);

    const result = await dbEngine.getGameRows();

    res.json(result);
}

controllerGameAPI.GETAllGames = GETAllGames;


async function GETAllMessages(req, res, next) {
    debugPrinter.printMiddleware(GETAllMessages.name);

    const result = await dbEngineMessage.getMessageRowsByGameID(req.game.game_id);

    res.json(result);
}

controllerGameAPI.GETAllMessages = GETAllMessages;

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

controllerGameAPI.GETCurrentGame = GETCurrentGame;

async function POSTSendMessage(req, res, next) {
    const { message } = req.body;

    const result = await dbEngineMessage.createMessageRow(
        req.game.game_id,
        req.player.player_id,
        message,
    );

    io.in(req.game.game_id).emit('server-game-message', result);

    res.json(result);
}

controllerGameAPI.POSTSendMessage = POSTSendMessage;

module.exports = controllerGameAPI;
