// eslint-disable-next-line no-var,no-undef
var socket = io();
const LOCALHOST_SIZE = 'http://localhost:3000/'.length;
socket.on('connect', () => {
    console.log(`Connected, your id is: ${socket.id}`);

    // THIS MUST BE CALLED ONCE AND BEFORE ANY OTHER EVENTS

    // grab the current path, only care for the route.
    const currPath = window.location.href.slice(LOCALHOST_SIZE);
    console.log(currPath);

    // check to see if thwe word 'game' exists anywhere on this path.
    const gameRE = '(?:game)';
    const containsGame = currPath.search(gameRE);
    console.log(`contains game: ${containsGame > -1}`);
    // emit the game_id if it does.
    if (containsGame > -1) {
        // game_id will I assume be always the second element when the path is tokenized.
        const game_id = currPath.split('/')[1];
        console.log(`game_id: ${game_id}`);
        socket.emit('client-join-room', game_id); // parsed game_id from URL.
    }

    // Test messages
    socket.emit('client-message', 'Hello 1');
    socket.emit('client-message', 'Hello 2');
    socket.emit('client-message', 'Hello 3');
});

/*
On Server game message
 */
socket.on('server-game-message', (msg) => {
    console.log('MESSAGE FROM THE SERVER RELATIVE TO THE GAME:');
    console.log(msg);
    console.log(
        'asldkfjaklsdjfklasdjfklasjdlkfjaslkdfjlaskjflkasdjflkasdjlkfdasjlkfasjdklf',
    );
});

/*
On Server message
 */
socket.on('server-message', (msg) => {
    console.log('MESSAGE FROM THE SERVER:');
    console.log(msg);
});
