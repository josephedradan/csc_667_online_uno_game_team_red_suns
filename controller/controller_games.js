const controllerGames = {}

function renderPreGameLobby(req, res, next) {
    console.log("MAIN TSET JOSEPH")
    res.render("pregame_lobby", {title: "Pre-game Lobby"});
}

controllerGames.renderPreGameLobby = renderPreGameLobby;

function renderTestGame(req, res, next) {
    console.log("TEST GAME")
    res.render("game_lobby", {title: "Game Lobby"});
}

controllerGames.renderTestGame = renderTestGame

module.exports = controllerGames
