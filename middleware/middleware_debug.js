const debugPrinter = require('../util/debug_printer');

const middlewareDebug = {};

function printSpacing(req, res, next) {
    debugPrinter.print('');
    debugPrinter.print('');
    debugPrinter.print('');
    debugPrinter.print('');
    debugPrinter.print('');
    debugPrinter.print('');
}

function printDebuggingVariables(req, res, next) {
    debugPrinter.printDebug('req.method');
    debugPrinter.printBackendMagenta(req.method);
    debugPrinter.printDebug('req.url');
    debugPrinter.printBackendMagenta(req.url);
    debugPrinter.printDebug('req.body');
    debugPrinter.printBackendMagenta(req.body);
    debugPrinter.printDebug('req.user');
    debugPrinter.printBackendMagenta(req.user);
}

function printDebugger(textHeader, color) {
    async function printDebuggerWrapped(req, res, next) {
        if (process.env.NODE_ENV === 'development') {
            printSpacing(req, res, next);

            debugPrinter.printCustom(`--- (${textHeader}) DEBUGGING MIDDLEWARE START ---`, color);

            printDebuggingVariables(req, res, next);

            debugPrinter.printCustom(`--- (${textHeader}) DEBUGGING MIDDLEWARE END ---`, color);
        }

        next();
    }

    return printDebuggerWrapped;
}

middlewareDebug.printDebugger = printDebugger;

module.exports = middlewareDebug;
