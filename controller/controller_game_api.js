/*
Handle all the game api calls

 */
const dbEngine = require('./db_engine');
const debugPrinter = require('../util/debug_printer');
const logicGameUno = require('./logic_game_uno');
const handlerGameUno = require('./handler_game_uno');
const utilCommon = require('../util/utilCommon');
const dbEngineGameUno = require('../controller/db_engine_game_uno');

const controllerGameAPI = {};

// controllerGameAPI.initializeDrawStack = async () => {
//     const newDeck = [];
//     const coloredNumCards = await dbEngine.getCardTableOnType('NUMBER');
//     const blackWildCards = await dbEngine.getCardTableOnType('SPECIAL');
// };

async function postPlayCard(req, res, next) {
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

controllerGameAPI.postPlayCard = postPlayCard;

async function getDrawCard(req, res, next) {
    // TODO: SOCKET HERE

    res.json({
        status: 'success',
        message: 'you drew a card',
    });
}

controllerGameAPI.getDrawCard = getDrawCard;

async function getStartGame(req, res, next) {
    // TODO: SOCKET HERE

    res.json({
        status: 'success',
        message: 'game started',
    });
}

controllerGameAPI.getStartGame = getStartGame;

async function postCreateGame(req, res, next) {
    debugPrinter.printMiddleware(postCreateGame.name);

    const result = await handlerGameUno.createGameWrapped(req.user.user_id);

    res
        .status(200)
        .json(result);
}

controllerGameAPI.postCreateGame = postCreateGame;

async function getAllGames(req, res, next) {
    debugPrinter.printMiddleware(getAllGames.name);

    const result = await dbEngine.getGameRows();

    res.json(result);
}

controllerGameAPI.getAllGames = getAllGames;

async function getCurrentGame(req, res, next) {
    debugPrinter.printMiddleware(getCurrentGame.name);

    const result = await dbEngineGameUno.getGameRowByGameID(req.params.game_id);
    debugPrinter.printDebug(result)
    res.json(result);
}

controllerGameAPI.getCurrentGame = getCurrentGame;

module.exports = controllerGameAPI;
