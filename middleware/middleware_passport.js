/*
This file contains middleware that is related to middlewarePassport. Basically, this middleware is responsible for allowing
and denying access to other middleware.

Reference:
    Node.js Passport Login System Tutorial
        Reference:
            https://www.youtube.com/watch?v=-RCnNyD0L-s

 */

const passport = require('passport');
const debugPrinter = require('../utils/debug_printer');

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
    if (req.isAuthenticated()) {
        // console.log(req); // May or may not be undefined if user is not authenticated

        next();
    } else {
        res.json({
            status: 'failed',
            message: 'User must be logged in to use this feature',
        });
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
    if (req.isUnauthenticated()) {
        next();
    } else {
        res.json({
            status: 'failed',
            message: `${req.user.username} you are logged in, you must not be logged in to use this feature`,
        });
    }
};

function callbackCustomWrapper(req, res, next) {
    /*
    Custom passport callback.
    Use this if you are not using passport.authenticate('local')

    Notes:
        This is the done_callback given to getUserToAuthenticate inside of passport_config

        * The actual logging in is done by req.logIn call

    Reference:
            Passport authentication with JWT: How can I change passport's default unauthorized response to my custom response?
                Notes:
                    "As per the official documentation of Passport you may use custom callback function to handle the case of failed
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
    function callbackCustom(err, user, info) {
        // Standard error checking (error happened from 0
        if (err) {
            return next(err);
        }

        /*
        If user was not found by the passport strategy

        Notes:
            It's a very bad idea to tell the user what they failed on when they login, it is a security risk
         */
        if (!user) {
            // Unsuccessful login response
            res.status(403)
                .json({
                    status: 'failed',
                    message: 'Password/Username is invalid', // If you care about security
                    // message: info.message, // If you don't care about security
                });
        } else { // If user was found by the passport strategy
            /*
            Login
                Notes:
                    This is the actual login, this will put the user in the session (express-session).
                    This function comes from the passport package
            */
            req.logIn(user, async (errorPassportLogin) => {
                if (errorPassportLogin) {
                    next(errorPassportLogin);
                } else {
                    // Successful login response
                    res.status(200)
                        .json({
                            status: 'success',
                            message: 'You have successful login!',
                            user_id: req.user.user_id,
                            username: req.user.username,
                        });
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
    function middlewarePassportAuthenticatePseudo(req, res, next) {
        // This is the actual passport.authenticate
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

module.exports = middlewarePassport;
