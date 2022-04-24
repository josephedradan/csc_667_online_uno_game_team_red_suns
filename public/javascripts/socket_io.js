// eslint-disable-next-line no-var
var socket = io();

socket.on('connect', () => {
    console.log(`Connected using ${socket.id}`);

    const gameRow = null;

    // var pathname = new URL(window.location.href).;
    //
    // console.log(window.location.href);
    //
    //
    // fetch(window.location.href, { method: 'GET' })
    //     .then((response) => {
    //         gameRow = response.json();
    //         console.log(gameRow);
    //     });
    //
    // console.log(gameRow);

    socket.emit('join-room', window.location.href);
});
socket.on('message', (msg) => {
    console.log(`message: ${msg}`);
});

socket.emit('temp', 'yolo from frontend');
