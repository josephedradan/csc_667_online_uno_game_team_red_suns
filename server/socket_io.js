/*
Add more socket io middleware

Notes:
    Recall that socket.io middleware via using io.use call all happen before any io.on call

 */

const connectionContainer = require('./server');
const debugPrinter = require('../util/debug_printer');

const handlerSocketIOUseExpress = require('../controller/handler_socket_io_use_express');

// Use socketIO events
require('../controller/socket_io_events');
