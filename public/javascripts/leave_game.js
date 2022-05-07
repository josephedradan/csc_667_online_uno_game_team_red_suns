const leaveGame = document.getElementById('leaveGame');

leaveGame.addEventListener('click', async () => {
    await axios.post(`${getGameId()}/leaveGame`, {});
    window.location.pathname = '/';
});
