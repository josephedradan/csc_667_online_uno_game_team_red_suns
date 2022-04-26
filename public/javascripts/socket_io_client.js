// eslint-disable-next-line no-var,no-undef
var socket = io();

socket.on('connect', () => {
    console.log(`Connected, your id is: ${socket.id}`);

    // THIS MUST BE CALLED ONCE AND BEFORE ANY OTHER EVENTS
    socket.emit('client-join-room'); // parse for game_id from URL.

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
