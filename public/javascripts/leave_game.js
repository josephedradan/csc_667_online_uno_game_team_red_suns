const leaveGame = document.getElementById('leaveGame');
if (leaveGame) {
    leaveGame.addEventListener('click', () => {
        axios
            .post(`${getGameId()}/leaveGame`, {})
            .then((response) => {
                window.location.pathname = '/';
            })
            .catch((err) => console.log(`Leaving game error: ${err}`));
    });
}
