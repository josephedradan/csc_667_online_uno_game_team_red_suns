const leaveGame = document.getElementById("leaveGame");
leaveGame.addEventListener("click", () => {
    axios.post(`${getGameId()}/leaveGame`, {});
    window.location.pathname = "/";
});
