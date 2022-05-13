const create_game = document.getElementById('createGame');
if (create_game) {
    create_game.addEventListener('click', () => {
        // fetch('/createGame', { method: 'POST' }).then((response) => {
        //     window.location = response.url;
        // });
        axios.post('createGame', {}).then((response) => {
            console.log(response);
            window.location = response.data.url;
        });
    });
}
