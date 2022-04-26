// eslint-disable-next-line no-var,no-undef
var socket = io();
const LOCALHOST_SIZE = 'http://localhost:3000/'.length;
socket.on('connect', () => {
    console.log(`Connected, your id is: ${socket.id}`);

    // THIS MUST BE CALLED ONCE AND BEFORE ANY OTHER EVENTS
    const currPath = window.location.href.slice(LOCALHOST_SIZE);
    console.log(currPath);

    const gameRE = '(?:game)';
    const containsGame = currPath.search(gameRE);
    console.log(`contains game: ${containsGame > -1}`);
    if (containsGame > -1) {
        const gameId = currPath.split('/')[1];
        console.log(`game_id: ${gameId}`);
        socket.emit('client-join-room', gameId); // parse for game_id from URL.
    // TODO: PARSE URL Using Window object, review regex to grab game_id, verify if youre in the game lobby
    }

    // Test messages
    socket.emit('client-message', 'Hello 1');
    socket.emit('client-message', 'Hello 2');
    socket.emit('client-message', 'Hello 3');
});

/*
On Server messsage
 */
socket.on('server-message', (msg) => {
    console.log('MESSAGE FROM THE SERVER:');
    console.log(msg);
});
