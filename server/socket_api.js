/*

Reference:
    Using socket.io in Express 4 and express-generator's /bin/www
        Notes:
            If you are using Express-Generator and want to use socket.io
        Reference:
            https://stackoverflow.com/questions/24609991/using-socket-io-in-express-4-and-express-generators-bin-www

    Integrating Socket.IO
        Notes:
            socket.io basics
        Reference:
            https://socket.io/get-started/chat#integrating-socketio

 */

/* ############################## socket.io ############################## */

const socket_io = require("socket.io");
const connectionContainer = require("./server");

const io = new socket_io.Server(connectionContainer.serverHttp);

const socketAPI = {
    io,
};

// Add your socket.io logic here!
io.on("connection", (socket) => {});

module.exports = socketAPI;
