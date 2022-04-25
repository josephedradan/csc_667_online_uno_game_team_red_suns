/*
Load the events for the socket.io server instance to use

IMPORTANT NOTES:
    *** RECALL THAT MIDDLEWARE FOR SOCKETS IS CALLED ONCE STATE BY io.user AND BEFORE ANY OTHER EVENT SUCH AS
        io.on

 */

require('../middleware/socket_io_middleware_game_uno');
require('./socket_io_controller_game_api');
require('./socket_io_controller_message');
