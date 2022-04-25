const connectionContainer = require('../server/server');

const { io } = connectionContainer;

const debugPrinter = require('../util/debug_printer');

async function broadcastMessage() {
    // TODO: Need room id

    io.on('connection', (socket) => {
        debugPrinter.printSuccess(`Client Socket 1: ${socket.id}`);

        socket.emit('message', 'Test'); // Client
        // socket.broadcast.emit('message', "Test") // Everyone but clietn
        // io.emit('message', "Test") // // all

        socket.to(2)
            .emit('sdfsd');
    });
}
