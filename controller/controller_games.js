const controllerGames = {};

controllerGames.renderPreGameLobby = (req, res, next) => {
    console.log('MAIN TSET JOSEPH');
    res.render('lobby', { title: 'Lobby', inGame: true });
};

controllerGames.renderTestGame = (req, res, next) => {
    console.log('TEST GAME');
    res.render('lobby', { title: 'Game Lobby' });
};

module.exports = controllerGames;
