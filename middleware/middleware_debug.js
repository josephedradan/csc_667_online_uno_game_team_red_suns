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

            debugPrinter.printBackendGreen('req.url');
            debugPrinter.printDebug(req.url);
            debugPrinter.printBackendGreen('req.body');
            debugPrinter.printDebug(req.body);
            debugPrinter.printBackendGreen('req.user');
            debugPrinter.printDebug(req.user);

            debugPrinter.printBackendYellow(`--- (${textHeader}) DEBUGGING MIDDLEWARE END ---`);
        }

        next();
    }

    return printDebuggerWrapped;
}

middlewareDebug.printDebugger = printDebugger;

module.exports = middlewareDebug;
