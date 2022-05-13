// const util_socket_common = require("./util_socket_common");
const in_game_socket_message = document.getElementById('socket_message');
const in_game_socket_message_button = document.getElementById(
    'in_game_socket_message_button',
);
if (in_game_socket_message) {
    in_game_socket_message.addEventListener('keypress', (e) => {
        // behavior explained: shift + enter will make new line in text area
        // by default a user can hit enter to send message.
        if (e.key == 'Enter' && !e.shiftKey) {
            e.preventDefault();
            axios.post(`/game/${getGameId()}/sendMessage`, {
                message: in_game_socket_message.value,
            });
            in_game_socket_message.value = '';
        }
    });

    in_game_socket_message_button.addEventListener('click', (e) => {
        axios.post(`/game/${getGameId()}/sendMessage`, {
            message: in_game_socket_message.value,
        });
        in_game_socket_message.value = '';
    });
}
