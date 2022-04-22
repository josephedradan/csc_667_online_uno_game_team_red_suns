const dbEngineGameUno = require('./db_engine_game_uno');
const debugPrinter = require('../util/debug_printer');

const logicGameUno = {};

async function createPlayer(user_id) {
    debugPrinter.printFunction(createPlayer.name);
    return dbEngineGameUno.createPlayer(user_id);
}

logicGameUno.createPlayer = createPlayer;

async function createGame() {
    debugPrinter.printFunction(createGame.name);
    return dbEngineGameUno.createGame();
}

logicGameUno.createGame = createGame;

async function addPlayerToGame(game_id, player_id, is_host) {
    debugPrinter.printFunction(addPlayerToGame.name);
    return dbEngineGameUno.addToPlayers(game_id, player_id, is_host);
}

logicGameUno.addPlayerToGame = addPlayerToGame;

async function generateCardsForGame(game_id) {
    debugPrinter.printFunction(generateCardsForGame.name);
}
logicGameUno.generateCardsForGame = generateCardsForGame;

module.exports = logicGameUno;
