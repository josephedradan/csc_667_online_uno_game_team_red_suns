const create_game = document.getElementById("createGame");

create_game.addEventListener("click", () => {
    fetch("/createGame", { method: "POST" }).then((response) => {
        window.location = response.url;
    });
});
