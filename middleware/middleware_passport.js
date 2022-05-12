/*
This file contains middleware that can check if a user is authenticated or can authenticate the user.
Basically, this middleware is responsible for allowing and denying access to other middleware and login the user.

Notes:
    Middleware:
        checkAuthenticated
            Check if the user is authenticated (logged in)
        checkUnauthenticated
            Check if the user is not authenticated (not logged in)
        authenticate
            Login the user and store their information in their session

Reference:
    Node.js Passport Login System Tutorial
        Reference:
            https://www.youtube.com/watch?v=-RCnNyD0L-s

 */

const passport = require('passport');
const debugPrinter = require('../util/debug_printer');
const utilCommon = require('../controller/util_common');
const constants = require('../config/constants');

const middlewarePassport = {};

/**
 * Check if user is authenticated before allowing to execute the next middleware
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
middlewarePassport.checkAuthenticated = async (req, res, next) => {
    debugPrinter.printMiddleware('checkAuthenticated');

    if (req.isAuthenticated()) {
        next();
    } else {
        const jsonResponse = utilCommon.getJsonResponseAndAttachMessageToSessionMessageIfPossible(
            req,
            constants.FAILURE,
            'User must be logged in to use this feature',
        );

        if (req.method === constants.GET) {
            res.redirect(jsonResponse.url);
        } else {
            res.json(jsonResponse);
        }
    }
};

/**
 * Check if user is NOT authenticated before allowing to execute the next middleware
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
middlewarePassport.checkUnauthenticated = async (req, res, next) => {
    debugPrinter.printMiddleware('checkUnauthenticated');

    if (req.isUnauthenticated()) {
        next();
    } else {
        const jsonResponse = utilCommon.getJsonResponseAndAttachMessageToSessionMessageIfPossible(
            req,
            constants.FAILURE,
            `${req.user.username} you are logged in, you must not be logged in to use this feature`,
        );

        if (req.method === constants.GET) {
            res.redirect(jsonResponse.url);
        } else {
            res.json(jsonResponse);
        }
    }
};

/**
 * This function should respond to the user if they have successfully logged in or not
 *
 * IMPORTANT NOTES:
 *      This function is the callback given to verifyCallback which should be in handler_passport
 *
 * Notes:
 *      The purpose of this function is to propagate the next function
 *      Use this if you are not using passport.authenticate('local')
 *
 * @param req
 * @param res
 * @param next
 * @returns {(function(*, *, *): (*|undefined))|*}
 */
function callbackCustomWrapper(req, res, next) {
    debugPrinter.printFunction(callbackCustomWrapper.name);

    /*
    Notes:
        The below is the doneCallback given to verifyCallback inside of handler_passport

        * The actual logging in is done by the req.login call

    Reference:
            Passport authentication with JWT: How can I change passport's default unauthorized response to my custom response?
                Notes:
                    "As per the official documentation of Passport you may useExpressMiddleware custom callback function to handle the case of failed
                    authorization and override the default message."

                Reference:
                    https://stackoverflow.com/a/56730006/9133458

            Custom Callback
                Notes:
                    Format used for this authenticate function
                Reference:
                    http://www.passportjs.org/docs/authenticate/#custom-callback

            How to show custom error messages using passport and express
                Notes:
                Reference:
                    https://stackoverflow.com/a/35455255/9133458

    */
    function callbackCustom(err, attributesAddedToReqUser, info) {
        debugPrinter.printFunction(callbackCustom.name);

        debugPrinter.printBackendGreen('attributesAddedToReqUser');
        debugPrinter.printBackendBlue(attributesAddedToReqUser);
        debugPrinter.printBackendGreen('info');
        debugPrinter.printBackendBlue(info);

        // Standard error checking (error should have come from the custom verifyCallback call most likely in handler_passport)
        if (err) {
            next(err);
            // eslint-disable-next-line brace-style
        }
        /*
        If attributesAddedToReqUser was not given by the passport strategy.
        The strategy should have returned information that should be added to req.user

        Notes:
            It's a very bad idea to tell the user what they failed on when they log in, it is a security risk
         */
        else if (!attributesAddedToReqUser) {
            // Unsuccessful login response

            const jsonResponse = utilCommon.getJsonResponseAndAttachMessageToSessionMessageIfPossible(req, constants.FAILURE, 'Password/Username is invalid'); // If you care about security

            res.json(jsonResponse);

            // res.redirect('back');
            // next();
        } else {
            /*
            If null was given by the passport strategy.

            Login
                Notes:
                    This is the actual login, this will put the attributesAddedToReqUser in req.user and put req.user in
                    the session (express-session).
                    The req.login function comes from the passport package.

                Reference:
                    Log In
                        Notes:
                            "Passport exposes a login() function on req (also aliased as login()) that can be used to
                            establish a login session."

                            "When the login operation completes, user (attributesAddedToReqUser) will be assigned to req.user."

                            "Note: passport.authenticate() middleware invokes req.login() automatically.
                            This function is primarily used when users sign up, during which req.login()
                            can be invoked to automatically log in the newly registered user."

                        Reference:
                            https://www.passportjs.org/concepts/authentication/login/
            */
            req.logIn(attributesAddedToReqUser, async (errorPassportLogin) => {
                debugPrinter.printFunction('req.login');

                if (errorPassportLogin) {
                    next(errorPassportLogin);
                } else {
                    // Successful login response
                    // req.session.message = {
                    //     status: constants.SUCCESS,
                    //     message: `${req.user.username} has logged in`,
                    //     // user_id: req.user.user_id,
                    //     // username: req.user.username,
                    // };

                    // Successful login response
                    utilCommon.attachMessageToSessionMessageIfPossible(req, constants.SUCCESS, `${req.user.username} has logged in`);

                    next();
                }
            });
        }
    }

    return callbackCustom;
}

/**
 * Mimic passport.authenticate function to allow for multiple different strategies and a custom callback function.
 * By mimicking passport.authenticate we now have access to different strategies other than 'local'.
 * The custom callback function allows us to have a RESTful API return
 *
 * @param strategy
 * @returns {middlewarePassportAuthenticatePseudo}
 */
function authenticate(strategy) {
    debugPrinter.printMiddleware(authenticate.name);

    function middlewarePassportAuthenticatePseudo(req, res, next) {
        // Calling passport.authenticate()
        const middlewarePassportAuthenticate = passport.authenticate(
            strategy,
            callbackCustomWrapper(req, res, next),
            next,
        );

        middlewarePassportAuthenticate(req, res, next);
    }

    return middlewarePassportAuthenticatePseudo;
}

middlewarePassport.authenticate = authenticate;

/**
 * Log out user based on the passport package
 *
 * Reference:
 *      Log Out
 *          Reference:
 *              http://www.passportjs.org/docs/logout/
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function logOut(req, res, next) {
    // Get username (It will not exist in the session once you log out)
    const { username } = req.user;

    // Will log out user (this functionality is handled by the passport package)
    req.logOut();

    // Remove the session of the user
    req.session.destroy((err) => {
        if (err) {
            next(err);
        } else {
            res.clearCookie('connect.sid');
            next();
        }
    });
}

middlewarePassport.logOut = logOut;

module.exports = middlewarePassport;
