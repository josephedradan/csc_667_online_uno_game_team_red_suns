// const connectionContainer = require('../server/server');
// const debugPrinter = require('../util/debug_printer');
//
// const socketIOLogicGameUno = {};
//
// async function broadcastMessage() {
//     // TODO: Need room id
//
//     connectionContainer.io.on('connection', (socket) => {
//         debugPrinter.printSuccess(`Client Socket 1: ${socket.id}`);
//
//         socket.emit('message', 'Test'); // Client
//         // socket.broadcast.emit('message', "Test") // Everyone but clietn
//         // io.emit('message', "Test") // // all
//
//         socket.to(2)
//             .emit('sdfsd');
//     });
// }
//
// module.exports = socketIOLogicGameUno;
