#!/usr/bin/env node

/*

Reference:
    Express.js - application.listen vs serverHttp.listen
        Notes:
            serverHttp.listen gives you more control and useExpressMiddleware can useExpressMiddleware https because application.listen returns http.

        Reference:
            https://stackoverflow.com/questions/17696801/express-js-app-listen-vs-server-listen

    Listen on HTTP and HTTPS for a single express application
        Notes:
            http and https
        Reference:
            https://stackoverflow.com/questions/8355473/listen-on-http-and-https-for-a-single-express-app

    Express
        Notes:
            application.listen([port[, host[, backlog]]][, callback])

            " The application returned by express() is in fact a JavaScript Function, designed to be passed to Node’s HTTP
            servers as a callback to handle requests. This makes it easy to provide both HTTP and HTTPS versions of
            your application with the same code base, as the application does not inherit from these (it is simply a callback)"

        Reference:
            https://expressjs.com/en/api.html

    Using socket.io in Express 4 and express-generator's /bin/www
        Notes:
            If you are using Express-Generator and want to useExpressMiddleware socket.io
        Reference:
            https://stackoverflow.com/questions/24609991/using-socket-io-in-express-4-and-express-generators-bin-www

 */

/**
 * Module dependencies.
 */

const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const debug = require('debug')('application:serverHttp');

const debugPrinter = require('../util/debug_printer');
// const socketAPI = require("./socket_api");

/*
##############################################################################################################
Setup and Settings
##############################################################################################################
 */

const connectionContainer = {};

/**
 * Normalize a PORT into a number, string, or false.
 */

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (Number.isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // PORT number
        return port;
    }

    return false;
}

const PORT = normalizePort(process.env.PORT || '3000');

/* ############################## Express ############################## */
const app = express();
connectionContainer.application = app;
/**
 * Get PORT from environment and store in Express.
 */

app.set('port', PORT); // application is a callback

/**
 * Create HTTP server.
 */

/* ############################## http server ############################## */

const serverHttp = http.createServer(app);
connectionContainer.serverHttp = serverHttp;

/**
 * Listen on provided PORT, on all network interfaces.
 */

serverHttp.listen(PORT, async (err) => {
    if (err) {
        console.log(err);
        return;
    }

    if (process.env.NODE_ENV === 'development') {
        debugPrinter.printBackendWhite('--- SERVER START UP START ---');

        debugPrinter.printBackendBlue('On Development mode...');
        debugPrinter.printBackendBlue(`Server listening on port: ${PORT}`);
        debugPrinter.printBackendBlue(
            `process.env.DATABASE_URL: ${process.env.DATABASE_URL}`,
        );

        debugPrinter.printBackendWhite('--- SERVER START UP END ---');
    }
});

/**
 * Event listener for HTTP serverHttp "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
    case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
    case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
    default:
        throw error;
    }
}

serverHttp.on('error', onError);

/**
 * Event listener for HTTP serverHttp "listening" event.
 */

function onListening() {
    const address = serverHttp.address();
    const bind = typeof address === 'string'
        ? `pipe ${address}`
        : `PORT ${address.port}`;
    debug(`Listening on ${bind}`);
}

/* ############################## socket.io ############################## */

const io = new socketIO.Server(serverHttp);
connectionContainer.io = io;

module.exports = connectionContainer;
