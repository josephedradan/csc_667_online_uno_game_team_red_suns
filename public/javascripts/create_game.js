const create_game = document.getElementById("createGame");
create_game.addEventListener("click", () => {
    // axios.post("/createGame", {}).then((response) => {
    //     window.location = response.url;
    // });
    fetch("/createGame", { method: "POST" }).then((response) => {
        window.location = response.url;
    });
});
