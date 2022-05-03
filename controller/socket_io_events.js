/*
Load the events for the socket.io server instance to use

IMPORTANT NOTES:
    *** RECALL THAT MIDDLEWARE FOR SOCKETS IS CALLED ONCE STATE BY io.user AND BEFORE ANY OTHER EVENT SUCH AS
        io.on

    ******** WHY WE DON'T DO COMMUNICATION FROM CLIENT TO SERVER USING SOCKETS:
        race condition,
        you need to separate concerns,
        loss of connection from the client,
        lots of code with data everywhere

 */

// require('../ignore/socket_io_middleware_game_uno');
require('./socket_io_controller');
