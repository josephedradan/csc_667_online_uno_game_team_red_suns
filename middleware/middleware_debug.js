const debugPrinter = require('../util/debug_printer');

const middlewareDebug = {};

function printDebugger(textHeader) {
    async function printDebuggerWrapped(req, res, next) {
        if (process.env.NODE_ENV === 'development') {
            debugPrinter.print('');
            debugPrinter.print('');
            debugPrinter.print('');
            debugPrinter.print('');
            debugPrinter.print('');
            debugPrinter.print('');

            debugPrinter.printBackendYellow(`--- (${textHeader}) DEBUGGING MIDDLEWARE START ---`);

            debugPrinter.printDebug('req.method');
            debugPrinter.printBackendMagenta(req.method);
            debugPrinter.printDebug('req.url');
            debugPrinter.printBackendMagenta(req.url);
            debugPrinter.printDebug('req.body');
            debugPrinter.printBackendMagenta(req.body);
            debugPrinter.printDebug('req.user');
            debugPrinter.printBackendMagenta(req.user);

            debugPrinter.printBackendYellow(`--- (${textHeader}) DEBUGGING MIDDLEWARE END ---`);
        }

        next();
    }

    return printDebuggerWrapped;
}

middlewareDebug.printDebugger = printDebugger;

module.exports = middlewareDebug;
