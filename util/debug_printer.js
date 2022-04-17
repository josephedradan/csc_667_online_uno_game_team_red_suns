/*
Purpose:
    Custom printer for console logging

Details:

Description:

Notes:
    Dumb note:
        Must use

        Rather than
            input instanceof String

        because javascript is dumb

        Reference:
            https://stackoverflow.com/questions/203739/why-does-instanceof-return-false-for-some-literals

IMPORTANT NOTES:

Explanation:

Reference:
    Javascript - Template Strings Don't Pretty Print Objects
        Reference:
            https://stackoverflow.com/questions/46146860/javascript-template-strings-dont-pretty-print-objects

 */

/*
Requires the colors module

Reference:
    https://www.npmjs.com/package/colors

 */
const moment = require('moment');
const colors = require('colors');

// Getting the time

// Color objects
colors.setTheme(
    {
        error: ['white', 'bgRed'],
        success: ['white', 'bgGreen'],
        request: ['black', 'bgCyan'],
        warning: ['black', 'bgYellow'],
        debug: ['white', 'bgBlue'],
        middleware: ['white', 'bgMagenta'],
        router: ['white', 'bgBrightBlue'],
        function: ['black', 'bgGrey'],
        backend_red: ['white', 'bgRed', 'italic'],
        backend_blue: ['white', 'bgBlue', 'italic'],
        backend_green: ['white', 'bgGreen', 'italic'],
        backend_magenta: ['white', 'bgMagenta', 'italic'],

    },
);

/**
 * A wrapper function that should be over a given function that should do additional
 * work most likely related to debugging/development
 * @param functionGiven
 * @returns {(function(...[*]): void)|*}
 */
function wrapperPrinter(functionGiven) {
    return (...args) => {
        // args.forEach((item) => {
        //     console.log(typeof log(item);
        // });

        if (process.env.NODE_ENV === "development") { // TODO: SHOULD development SEE console.log STUFF?
            functionGiven(...args);
        }

        // functionGiven(...args);
    };
}

function printer(input, colorsTheme) {
    if (typeof input !== 'object') {
        // Color the input
        console.log(`${moment()
            .format()} ${input}`[colorsTheme]);

        // console.log(colors[colorsTheme](`${moment().format()} ${input}`)); // Does not work for some reason
    } else if (input === null) {
        console.log(`${moment()
            .format()} ${null}`[colorsTheme]);
    } else {
        // Color the format
        console.log(`${moment()
            .format()}`[colorsTheme]);

        // Color the input
        console.log(colors[colorsTheme](input));

        // Color the input (Alternative)
        // console.log(`${JSON.stringify(input)}`[colorsTheme]);
    }
}

// Custom printer for errors
const debugPrinter = {

    printError: wrapperPrinter((input) => {
        printer(input, 'error');
    }),
    printSuccess: wrapperPrinter((input) => {
        printer(input, 'success');
    }),
    printRequest: wrapperPrinter((input) => {
        printer(input, 'request');
    }),
    printWarning: wrapperPrinter((input) => {
        printer(input, 'warning');
    }),
    printDebug: wrapperPrinter((input) => {
        printer(input, 'debug');
    }),
    printMiddleware: wrapperPrinter((input) => {
        printer(input, 'middleware');
    }),
    printRoute: wrapperPrinter((input) => {
        printer(input, 'route');
    }),
    printFunction: wrapperPrinter((input) => {
        printer(input, 'function');
    }),
    printBackendRed: wrapperPrinter((input) => {
        printer(input, 'backend_red');
    }),
    printBackendBlue: wrapperPrinter((input) => {
        printer(input, 'backend_blue');
    }),
    printBackendGreen: wrapperPrinter((input) => {
        printer(input, 'backend_green');
    }),
    printBackendMagenta: wrapperPrinter((input) => {
        printer(input, 'backend_magenta');
    }),
};

// Export const printers
module.exports = debugPrinter;
