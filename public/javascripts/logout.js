const logout = document.getElementById('logout');
if (logout) {
    logout.addEventListener('click', async () => {
        // await fetch('/logout', { method: 'POST' }).then(
        //     (response) => (window.location = response.url),
        // );

        await axios
            .post('/logout', {})
            .then((response) => {
                window.location = response.data.url;
            })
            .catch((err) => console.log(`Logout: ${err}`));
    });
}
