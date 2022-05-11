const logout = document.getElementById("logout");
logout.addEventListener("click", async () => {
    // await axios.post("/createGame", {}).then((response) => {
    //     window.location = response.url;
    // });
    await fetch("/logout", { method: "POST" }).then(
        (response) => (window.location = response.url)
    );
});
