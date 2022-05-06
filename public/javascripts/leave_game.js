const leaveGame = document.getElementById("leaveGame");

console.log(getGameId());

leaveGame.addEventListener("click", async () => {
    await axios.post(`${getGameId()}/leaveGame`, {});
    window.location.pathname = "/";
});
