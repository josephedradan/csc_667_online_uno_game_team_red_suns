// eslint-disable-next-line no-var,no-undef
var socket = io();

socket.on('connect', () => {
    console.log(`Connected, your id is: ${socket.id}`);

    // socket.emit('join-room');

    socket.emit('message', 'Hello 1');
    socket.emit('message', 'Hello 2');
    socket.emit('message', 'Hello 3');
});

socket.on('message', (msg) => {
    console.log(`message: ${msg}`);
});

socket.emit('temp', 'yolo from frontend');
