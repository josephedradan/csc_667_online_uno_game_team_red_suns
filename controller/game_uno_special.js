const constants = require('../config/constants');

const gameUnoSpecial = {};

class GameUnoWinner {
    constructor(message, gameRowDetailed, playerRowDetailedWinner) {
        this.status = 200;
        this.message = message;
        this.status_game_uno = constants.SUCCESS;
        this.game = gameRowDetailed;
        this.player = playerRowDetailedWinner;
    }

    getJsonResponse() {
        return {
            status: this.status,
            message: this.message,
            status_game_uno: this.status_game_uno,
            game: this.game,
            player: this.player,
        };
    }
}

gameUnoSpecial.GameUnoWinner = GameUnoWinner;

module.exports = gameUnoSpecial;
