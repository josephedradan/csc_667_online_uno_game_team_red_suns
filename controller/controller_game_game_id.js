/*
Handle all the game api calls

 */
const logicGameUno = require('./logic_game_uno');

const handlerGameUno = require('./handler_game_uno');

const dbEngine = require('./db_engine');
const dbEngineGameUno = require('./db_engine_game_uno');

const utilCommon = require('../util/util_common');

const debugPrinter = require('../util/debug_printer');

const controllerGameAPI = {};

// controllerGameAPI.initializeDrawStack = async () => {
//     const newDeck = [];
//     const coloredNumCards = await dbEngine.getCardTableOnType('NUMBER');
//     const blackWildCards = await dbEngine.getCardTableOnType('SPECIAL');
// };

async function POSTPlayCard(req, res, next) {
    // TODO VALIDATE IF USER IS IN THAT GAME
    // TODO VALIDATE REQUEST
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

async function POSTCreateGame(req, res, next) {
    debugPrinter.printMiddleware(POSTCreateGame.name);

    const result = await handlerGameUno.createGameWrapped(req.user.user_id);

    res
        .status(200)
        .json(result);
}

controllerGameAPI.POSTCreateGame = POSTCreateGame;

async function GETAllGames(req, res, next) {
    debugPrinter.printMiddleware(GETAllGames.name);

    const result = await dbEngine.getGameRows();

    res.json(result);
}

controllerGameAPI.GETAllGames = GETAllGames;

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

// async function sendMessage(req, res, next) {
//     io.sockets;
// }
//
// controllerGameAPI.sendMessage = sendMessage;

module.exports = controllerGameAPI;
