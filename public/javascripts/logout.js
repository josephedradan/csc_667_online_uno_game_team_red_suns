const logout = document.getElementById("logout");
logout.addEventListener("click", async () => {
    await fetch("/logout", { method: "POST" }).then(
        (response) => (window.location = response.url)
    );
});
