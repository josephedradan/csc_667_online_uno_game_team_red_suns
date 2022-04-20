const controllerGames = {}

controllerGames.renderPreGameLobby = (req, res, next) =>{
    console.log("MAIN TSET JOSEPH")
    res.render("pregame_lobby", {title: "Pre-game Lobby"});
}


controllerGames.renderTestGame = (req, res, next) =>{
    console.log("TEST GAME")
    res.render("game_lobby", {title: "Game Lobby"});
}

controllerGames.renderTestMakeDeck = (req, res, next) => {
    /**
     * This is just a test to envoke a function that makes a deck in public/javascript
     */

    
    res.render("index");
}

module.exports = controllerGames
