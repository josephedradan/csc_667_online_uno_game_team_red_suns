#!/usr/bin/env node

/*

Reference:
    Express.js - app.listen vs serverHttp.listen
        Notes:
            serverHttp.listen gives you more control and use can use https because app.listen returns http.

        Reference:
            https://stackoverflow.com/questions/17696801/express-js-app-listen-vs-server-listen

    Listen on HTTP and HTTPS for a single express app
        Notes:
            http and https
        Reference:
            https://stackoverflow.com/questions/8355473/listen-on-http-and-https-for-a-single-express-app

    Express
        Notes:
            app.listen([port[, host[, backlog]]][, callback])

            " The app returned by express() is in fact a JavaScript Function, designed to be passed to Node’s HTTP
            servers as a callback to handle requests. This makes it easy to provide both HTTP and HTTPS versions of
            your app with the same code base, as the app does not inherit from these (it is simply a callback)"

        Reference:
            https://expressjs.com/en/api.html
 */

/**
 * Module dependencies.
 */

const http = require('http');
const express = require("express");
const socket_io = require("socket.io");

const debug = require('debug')('application:serverHttp');

const debugPrinter = require("../util/debug_printer");

// const socketAPI = require("./socket_api");


/**
 * Event listener for HTTP serverHttp "listening" event.
 */

function onListening() {
    const address = serverHttp.address();
    const bind = typeof address === 'string'
        ? 'pipe ' + address
        : 'PORT ' + address.port;
    debug('Listening on ' + bind);
}

/**
 * Event listener for HTTP serverHttp "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof PORT === 'string'
        ? 'Pipe ' + PORT
        : 'Port ' + PORT;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Normalize a PORT into a number, string, or false.
 */

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // PORT number
        return port;
    }

    return false;
}


/*
##############################################################################################################
Setup and Settings
##############################################################################################################
 */

let connectionContainer = {}

/*############################## Express ##############################*/

const app = express();
connectionContainer.app = app

/**
 * Get PORT from environment and store in Express.
 */

const PORT = normalizePort(process.env.PORT || '3000');
app.set('port', PORT); // app is a callback

/**
 * Create HTTP server.
 */

/*############################## http server ##############################*/

const serverHttp = http.createServer(app);
connectionContainer.serverHttp = serverHttp

/**
 * Listen on provided PORT, on all network interfaces.
 */

serverHttp.listen(PORT, (err) => {
    if (err) {
        console.log(err);
        return;
    }

    if (process.env.NODE_ENV === 'development') {
        debugPrinter.printBackendMagenta("On Development mode...")
    }

    debugPrinter.printBackendMagenta(`Server listening on port: ${PORT}`);
});

serverHttp.on('error', onError);
serverHttp.on('listening', onListening);


/*############################## socket.io ##############################*/


const io = new socket_io.Server(serverHttp)

connectionContainer.io = io

module.exports = connectionContainer;
