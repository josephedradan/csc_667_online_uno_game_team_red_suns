/*
Purpose:
    Custom print for console logging

Details:

Description:

Notes:
    Dumb note:
        Must useExpressMiddleware

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
        _red: ['white', 'bgRed'],
        _green: ['white', 'bgGreen'],
        _cyan: ['black', 'bgCyan'],
        _yellow: ['black', 'bgYellow'],
        _blue: ['white', 'bgBlue'],
        _magenta: ['white', 'bgMagenta'],
        _bright_blue: ['white', 'bgBrightBlue'],
        _grey: ['black', 'bgGrey'],
        backend_red: ['white', 'bgRed', 'italic'],
        backend_blue: ['white', 'bgBlue', 'italic'],
        backend_green: ['white', 'bgGreen', 'italic'],
        backend_magenta: ['white', 'bgMagenta', 'italic'],
        backend_white: ['black', 'bgWhite', 'italic'],
        backend_cyan: ['black', 'bgCyan', 'italic'],
        backend_yellow: ['black', 'bgYellow', 'italic'],

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

        if (process.env.NODE_ENV === 'development') { // TODO: SHOULD development SEE console.log STUFF?
            functionGiven(...args);
        }

        // functionGiven(...args);
    };
}

// eslint-disable-next-line no-underscore-dangle
function _print(input, colorsTheme, messageHeader) {
    // Printing non Objects
    if (typeof input !== 'object') {
        if (messageHeader) {
            console.log(`${moment()
                .format()} ${messageHeader} ${input}`[colorsTheme]);
        } else {
            console.log(`${moment()
                .format()} ${input}`[colorsTheme]);
        }

        // console.log(colors[colorsTheme](`${moment().format()} ${input}`)); // Does not work for some reason
        return;
    }

    // Printing null
    if (input === null) {
        if (messageHeader) {
            console.log(`${moment()
                .format()} ${messageHeader} ${input}`[colorsTheme]);
        } else {
            console.log(`${moment()
                .format()} ${input}`[colorsTheme]);
        }
        return;
    }

    // Printing Default
    if (messageHeader) {
        console.log(`${moment()
            .format()} ${messageHeader}`[colorsTheme]);
    } else {
        // Set the color for the next
        console.log(`${moment()
            .format()}`[colorsTheme]);
    }

    // Color the input
    console.log(colors[colorsTheme](input));

    // Color the input (Alternative)
    // console.log(`${JSON.stringify(input)}`[colorsTheme]);
}

// Custom print for errors
const debugPrinter = {

    print: wrapperPrinter((input) => {
        console.log(input);
    }),

    // Print with print type
    printError: wrapperPrinter((input) => {
        _print(input, '_red', 'ERROR:');
    }),
    printSuccess: wrapperPrinter((input) => {
        _print(input, '_green', 'SUCCESS:');
    }),
    printRequest: wrapperPrinter((input) => {
        _print(input, '_cyan', 'REQUEST:');
    }),
    printWarning: wrapperPrinter((input) => {
        _print(input, '_yellow', 'WARNING:');
    }),
    printDebug: wrapperPrinter((input) => {
        _print(input, '_blue', 'DEBUG:');
    }),
    printMiddleware: wrapperPrinter((input) => {
        _print(input, '_magenta', 'MIDDLEWARE:');
    }),
    printRoute: wrapperPrinter((input) => {
        _print(input, '_bright_blue', 'ROUTE:');
    }),
    printFunction: wrapperPrinter((input) => {
        _print(input, '_grey', 'FUNCTION:');
    }),

    // Print with print type (custom)
    printMiddlewareSocketIO: wrapperPrinter((input) => {
        _print(input, '_magenta', 'MIDDLEWARE SOCKET IO:');
    }),

    // Print based on color
    printRed: wrapperPrinter((input) => {
        _print(input, '_red');
    }),
    printGreen: wrapperPrinter((input) => {
        _print(input, '_green');
    }),
    printCyan: wrapperPrinter((input) => {
        _print(input, '_cyan');
    }),
    printYellow: wrapperPrinter((input) => {
        _print(input, '_yellow');
    }),
    printBlue: wrapperPrinter((input) => {
        _print(input, '_blue');
    }),
    printMagenta: wrapperPrinter((input) => {
        _print(input, '_magenta');
    }),
    printBrightBlue: wrapperPrinter((input) => {
        _print(input, '_bright_blue');
    }),
    printGrey: wrapperPrinter((input) => {
        _print(input, '_grey');
    }),

    // Print based on color (alternative that uses italics)
    printBackendRed: wrapperPrinter((input) => {
        _print(input, 'backend_red');
    }),
    printBackendBlue: wrapperPrinter((input) => {
        _print(input, 'backend_blue');
    }),
    printBackendGreen: wrapperPrinter((input) => {
        _print(input, 'backend_green');
    }),
    printBackendMagenta: wrapperPrinter((input) => {
        _print(input, 'backend_magenta');
    }),
    printBackendWhite: wrapperPrinter((input) => {
        _print(input, 'backend_white');
    }),
    printBackendCyan: wrapperPrinter((input) => {
        _print(input, 'backend_cyan');
    }),
    printBackendYellow: wrapperPrinter((input) => {
        _print(input, 'backend_yellow');
    }),

    printCustom: wrapperPrinter((input, colorTheme) => {
        _print(input, colorTheme);
    }),
};

// Export const printers
module.exports = debugPrinter;
