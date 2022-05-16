// catch 404 and forward to error handler
const createError = require('http-errors');
const express = require('express');
const debugPrinter = require('../util/debug_printer');
const gameUnoSpecial = require('../controller/game_uno_special');
const intermediateSocketIOGameUno = require('../controller/intermediate_socket_io_game_uno');

const routesEnd = express.Router();

routesEnd.use((req, res, next) => {
    next(createError(404));
});

// error handler
routesEnd.use((err, req, res, next) => {
    if (err instanceof gameUnoSpecial.GameUnoWinner) {
        intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_MessageServer_Wrapped(err.game.game_id, 'TESTING')
            .then(x => {

            })
            .catch(error => {
                debugPrinter.printError(err);
                debugPrinter.printError(err);
                }
            );
    } else {
        debugPrinter.printError(err);

        debugPrinter.printBackendRed('req.method');
        debugPrinter.printDebug(req.method);
        debugPrinter.printBackendRed('req.url');
        debugPrinter.printDebug(req.url);
        debugPrinter.printBackendRed('req.body');
        debugPrinter.printDebug(req.body);
        debugPrinter.printBackendRed('req.user');
        debugPrinter.printDebug(req.user);

        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    }
});

module.exports = routesEnd;
