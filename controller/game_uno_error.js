const constants = require('../config/constants');
const constantsGameUno = require('../config/constants_game_uno');

const gameUnoError = {};

class GameUnoError extends Error {
    constructor(message) {
        super(message);
        this.status = 200;
        this.status_game_uno = constants.FAILURE;
    }

    getJsonResponse() {
        return {
            message: this.message,
            status: this.status,

        };
    }
}

gameUnoError.GameUnoError = GameUnoError;

class GameUnoGetGameError extends GameUnoError {
    constructor(game_id) {
        super(`game_id ${game_id} does not exist`);
    }
}
gameUnoError.GameUnoGetGameError = GameUnoGetGameError;

class GameUnoUpdateCollectionError extends GameUnoError {
    constructor(game_id, collectionNameSource, collectionNameDestination) {
        super(`game_id ${game_id}, error when updating ${collectionNameSource} to ${collectionNameDestination}`);
    }
}
gameUnoError.GameUnoUpdateCollectionError = GameUnoUpdateCollectionError;

class GameUnoGetPlayerError extends GameUnoError {
    constructor(user_id, game_id) {
        super(`game_id ${game_id}, user_id ${user_id} does not have a player_id`);
    }
}
gameUnoError.GameUnoGetPlayerError = GameUnoGetPlayerError;

class GameUnoPlayerDoesNotHaveTurnError extends GameUnoError {
    constructor(game_id, player_id) {
        super(`game_id ${game_id}, player_id ${player_id} does not have the turn`);
    }
}
gameUnoError.GameUnoPlayerDoesNotHaveTurnError = GameUnoPlayerDoesNotHaveTurnError;

class GameUnoPlayerIsNotHostError extends GameUnoError {
    constructor(game_id, player_id) {
        super(`game_id ${game_id}, player_id ${player_id} does not have the turn`);
    }
}
gameUnoError.GameUnoPlayerIsNotHostError = GameUnoPlayerIsNotHostError;

///

// class GameUnoDoMoveCardHandToPlayLogicError extends GameUnoError {
//     constructor(game_id, player_id) {
//         super(`game_id ${game_id}, player_id ${player_id}, could not move card from ${constantsGameUno.COLLECTION_INFO_HAND} to ${constantsGameUno.COLLECTION_INFO_PLAY}`);
//     }
// }
// gameUnoError.GameUnoDoMoveCardHandToPlayLogicError = GameUnoDoMoveCardHandToPlayLogicError;

class GameUnoGameIsActiveError extends GameUnoError {
    constructor(game_id) {
        super(`game_id ${game_id} is active`);
    }
}
gameUnoError.GameUnoGameIsActiveError = GameUnoGameIsActiveError;

class GameUnoCreatePlayerError extends GameUnoError {
    constructor(user_id) {
        super(`user_id ${user_id}, player could not be created`);
    }
}
gameUnoError.GameUnoCreatePlayerError = GameUnoCreatePlayerError;

class GameUnoCreatePlayersError extends GameUnoError {
    constructor(user_id) {
        super(`user_id ${user_id}, players (WITH AN S) could not be created`);
    }
}
gameUnoError.GameUnoCreatePlayersError = GameUnoCreatePlayersError;

class GameUnoPlayerExistsInGameError extends GameUnoError {
    constructor(user_id, game_id, player_id) {
        super(`user_id ${user_id}, game_id ${game_id}, player_id ${player_id} already exists in game`);
    }
}
gameUnoError.GameUnoPlayerExistsInGameError = GameUnoPlayerExistsInGameError;

class GameUnoDeleteGameError extends GameUnoError {
    constructor(game_id) {
        super(`game_id ${game_id} could not be deleted`);
    }
}
gameUnoError.GameUnoDeleteGameError = GameUnoDeleteGameError;

class GameUnoGameIsActiveAndNoPlayersInGame extends GameUnoError {
    constructor(game_id) {
        super(`game_id ${game_id} has no Players with in_game set to true`);
    }
}
gameUnoError.GameUnoGameIsActiveAndNoPlayersInGame = GameUnoGameIsActiveAndNoPlayersInGame;

class GameUnoGameNoPlayersInGame extends GameUnoError {
    constructor(game_id) {
        super(`game_id ${game_id} has no Players`);
    }
}
gameUnoError.GameUnoGameNoPlayersInGame = GameUnoGameNoPlayersInGame;

class GameUnoUpdateGameError extends GameUnoError {
    constructor(game_id) {
        super(`game_id ${game_id} Game update has failed`);
    }
}
gameUnoError.GameUnoUpdateGameError = GameUnoUpdateGameError;

class GameUnoUpdateGameDataError extends GameUnoError {
    constructor(game_id) {
        super(`game_id ${game_id} GameData updated has failed`);
    }
}
gameUnoError.GameUnoUpdateGameDataError = GameUnoUpdateGameDataError;

class GameUnoDeletePlayerError extends GameUnoError {
    constructor(game_id, player_id) {
        super(`game_id ${game_id}, player_id ${player_id}, player could not be deleted`);
    }
}
gameUnoError.GameUnoDeletePlayerError = GameUnoDeletePlayerError;

class GameUnoCreateGameError extends GameUnoError {
    constructor(user_id, player_id) {
        super(`user_id ${user_id}, player_id ${player_id} cou;d not be created`);
    }
}
gameUnoError.GameUnoCreateGameError = GameUnoCreateGameError;

class GameUnoCreateGamaDataError extends GameUnoError {
    constructor(game_id) {
        super(`game_id ${game_id}, GameData could not be created`);
    }
}
gameUnoError.GameUnoCreateGamaDataError = GameUnoCreateGamaDataError;

class GameUnoDrawToPlayError extends GameUnoError {
    constructor(game_id) {
        super(`game_id ${game_id}, GameData could not be created`);
    }
}
gameUnoError.GameUnoDrawToPlayError = GameUnoDrawToPlayError;

class GameUnoCreateCardsError extends GameUnoError {
    constructor(game_id) {
        super(`game_id ${game_id}, Cards could not be created`);
    }
}
gameUnoError.GameUnoCreateCardsError = GameUnoCreateCardsError;

class GameUnoUpdatePlayersError extends GameUnoError {
    constructor(game_id) {
        super(`game_id ${game_id}, Players could not be updated`);
    }
}
gameUnoError.GameUnoUpdatePlayersError = GameUnoUpdatePlayersError;

class GameUnoGetPlayersError extends GameUnoError {
    constructor(game_id) {
        super(`game_id ${game_id}, Could not get Players`);
    }
}
gameUnoError.GameUnoGetPlayersError = GameUnoGetPlayersError;

module.exports = gameUnoError;
