/*
This file is responsible for setting up the settings used by the passport package

IMPORTANT NOTES:
    HOW THIS WORKS:
        If the user logs in:
            1. verifyCallback is called first (Assuming successful login)
                Something (we'll call X) should have been called to the database to get something about the user such as their username
            2. serializeUser is called second
                X (which will be username in this case) will be then added to the session (this will be used as an identifier)
            3. deserializeUser is called third (This call should have been called via req.logIn which should be in middleware_authentication_passport)
                X is used again to identify who the user is, but the identification should be used to get more information about the user
                which would then be added to req.user
            4. Standard login behavior happens and the cookie is sent back

        If the user makes a requests that are not static and is logged in:
            1. User sends the cookie they have been given by us
            2. deserializeUser is called
                This behavior should be similar to the deserializeUser stated prior, but we use the cookie to get X
            3. The behavior of the request should happen and req.user should have info about the user

        If the user logs out:
            1. Same behavior as (request that is not static and is logged in),
                but req.logOut should be called after which should be in middleware_authentication_passport
                and the session is deleted along with the cookie on the client side

        If the user makes a requests that are not static and is NOT logged in:
            No function related to passport should be called
Notes:
    passport.js is just middleware for authentication

Reference:
    Node.js Passport Login System Tutorial
        Notes:
            Brief understanding of the passport package
        Reference:
            https://www.youtube.com/watch?v=-RCnNyD0L-s

    Passport Local Configuration (Node + Passport + Express)
        Notes:
            In depth understanding of the passport package

            The "done" callback (doneCallback) in verifyCallback is the callback that should have been given to
            the passport.authenticate() function (this function should be located in middleware_authentication_passport)

        Reference:
            https://www.youtube.com/watch?v=xMEOT9J0IvI
            https://youtu.be/xMEOT9J0IvI?t=1147

    Passport Local Strategy Usage (Node + Passport + Express)
        Notes:
            In depth understanding of the passport package

            * Does have demonstration on how to authenticate different users

            done(null, false, {message: "whatever"})
                (argument 1) is an error, you can replace this with a string if you want, but this error should only
                be seen by the server

                (argument 2) is what should be put in the req unless it's false

                (argument 3) AKA info, is used for express-flash or some version of flash, you can catch it if you
                use a Custom Callback (http://www.passportjs.org/docs/authenticate/#custom-callback)

        Reference:
            https://www.youtube.com/watch?v=fGrSmBk9v-4&list=PLYQSCk-qyTW2ewJ05f_GKHtTIzjynDgjK&index=7

    Simple Passport Local Authentication w/ React & Node.js
        Notes:
            Basic the passport package understanding

            Has standard way of logging in using req.logIn

        Reference:
            https://www.youtube.com/watch?v=IUw_TgRhTBE&t=1538s

*/
const to = require('await-to-js').default;

const LocalStrategy = require('passport-local').Strategy;

const Account = require('./db_engine');
const debugPrinter = require('../util/debug_printer');
const handlerPassword = require('./handler_password');

// These are the fields that passport will look for in req.body
const REQ_BODY_FIELD_NAMES_TO_LOOK_FOR = {
    usernameField: 'username',
    passwordField: 'password',
};

const handlerPassport = {};

/**
 * Given 2 fields from req.body specified by REQ_BODY_FIELD_NAMES_TO_LOOK_FOR, try to log in the user.
 *
 * IMPORTANT NOTES:
 *      THIS FUNCTION IS NOT EXPLICITLY CALLED IN THE BACKEND, PASSPORT AUTOMATICALLY CALLS THIS.
 *
 * Notes:
 *      username and password are taken from the request body (req.body.username, req.body.password).
 *      It knows to use "username" and "password" based on the naming given from REQ_BODY_FIELD_NAMES_TO_LOOK_FOR that you set up.
 *
 *      This function is custom-made and specifically made for the local strategy.
 *
 * @param username
 * @param password
 * @param doneCallback
 * @returns {Promise<*>}
 */
async function verifyCallback(username, password, doneCallback) {
    debugPrinter.printFunction(verifyCallback.name);

    try {
        const data = await Account.getAccountByUsername(username);

        const user = data[0]; // First user

        // Invalid username
        if (user === null) {
            return doneCallback(
                null, // error (This must be null to allow the 3rd argument (info) to pass)
                false, // user
                {message: 'Invalid username'}, // info
            );
        }

        // if (process.env.NODE_ENV === 'development') {
        //     debugPrinter.printWarning(`HIT verifyCallback ${user}`);
        //     console.log(user);
        //     debugPrinter.printWarning(`HIT Password ${user.password}`);
        // }

        try {
            // If password is valid by comparing password from the req to the password in the db
            console.log("form information; " + username + " : " + password);
            if (await handlerPassword.compare(password, await user.password)) {
                // This doneCallback will attach the user object to req
                return doneCallback(
                    null, // error (This must be null to allow the 3rd argument (info) to pass)
                    user, // user
                    {message: 'Success'}, // info
                );
            }

            // If password is invalid
            return doneCallback(
                null, // error (This must be null to allow the 3rd argument (info) to pass)
                false, // user
                {message: 'Invalid password'}, // info
            );
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.log('verifyCallback Error');
                console.log(error);
            }
            return doneCallback(error);
        }
    } catch (err) {
        console.log("failure to query getAccountAndAccountStatisticsByUsername");
        console.log(err);
    }

}

/**
 * 1. Configure passport to use a custom local strategy via
 *      passport.use(localStrategy);
 *
 * 2. Configure passport when using express sessions via
 *      passport.serializeUser
 *      passport.deserializeUser
 *
 * Reference:
 *      Simple Passport Local Authentication w/ React & Node.js
 *
 *      Notes:
 *          The code below is based on this code style
 *
 *      Reference:
 *          https://youtu.be/IUw_TgRhTBE?t=1538
 *
 * @param passport
 */
handlerPassport.configurePassportLocalStrategy = (passport) => {
    const localStrategy = new LocalStrategy(
        REQ_BODY_FIELD_NAMES_TO_LOOK_FOR,
        verifyCallback,
    );

    // Apply what local strategy to use
    passport.use(localStrategy);

    /*
    Second parameter of the callback function is saved in the session which is then later used to retrieve the whole
    object via deserializeUser. Basically, the second argument of the callback is stored in the session.

    IMPORTANT NOTES:
        THIS FUNCTION IS ONLY CALLED WHEN LOGGING IN AND THAT THE LOGIN IS VALID.
        THIS FUNCTION IS NOT EXPLICITLY CALLED IN THE BACKEND, PASSPORT AUTOMATICALLY CALLS THIS.

    Notes:
        "Passport uses serializeUser function to persist user data (after successful authentication) into session."

        * Basically, determine what data of the user object should be stored in the session from user.
        Once a piece of data has been selected and passed to the doneCallBack function,
        it will then be passed into req.session.passport.user (Note that req.session.passport.user is a key value pair).
        The data that was passed into the cookie will then be USED by passport.deserializeUser automatically once the user makes
        another request to the backend.

        The thing stored in the session can be accessed via:
            req.session.passport.user

    Reference:
        Understanding passport serialize deserialize
            Reference:
                https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
     */
    passport.serializeUser((user, doneCallBack) => {
        debugPrinter.printFunction("serializeUser");

        /*
        Put the key (user.username) inside the passport of the session.
        It can be accessed via req.session.passport.user
         */
        doneCallBack(null, user.username);
    });

    /*
    Validate the cookie's key from the client AND ADD ATTRIBUTES/PROPERTIES TO THE REQ which should be in req.user

    IMPORTANT NOTES:
        THIS FUNCTION IS AUTOMATICALLY CALLED ON EVERY REQUEST IF CLIENT SENDS THE EXPRESS SESSION COOKIE.
        THIS FUNCTION IS NOT EXPLICITLY CALLED IN THE BACKEND, PASSPORT AUTOMATICALLY CALLS THIS.

    Notes:
        "The first argument of deserializeUser corresponds to the key of the user object that was given to the done
        function (doneCallBack)"

        "Function deserializeUser is used to retrieve user data from session."

        * Basically, this will automatically get the value of req.session.passport.user and it is up to the backend developer
        to deal with that value, then the backend developer must then call the correct done function call. For example,
        if serializeUser had put a username in the done function, then the first argument of deserializeUser will contain the username.

        ** This function is called every time a request is made to the backend WHEN THE USER IS ALREADY LOGGED IN.
        *** THIS FUNCTION IS RESPONSIBLE FOR GIVING INFORMATION TO THE CALLBACK. THE CALLBACK SHOULD THEN ADD THAT INFORMATION TO req.user

        Can access user stuff from the req via:
            req.user

    Reference:
        Understanding passport serialize deserialize
            Reference:
                https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
     */
    passport.deserializeUser(async (username, doneCallBack) => {
        debugPrinter.printFunction("deserializeUser");

        // if (process.env.NODE_ENV === 'development') {
        //     debugPrinter.printDebug(`initializePassport deserializeUser ${username}`);
        // }

        // Get the accountAndAccountStatistics via username
        let [error, accountAndAccountStatistics] = await to(Account.getAccountAndAccountStatisticsByUsername(username));

        accountAndAccountStatistics = accountAndAccountStatistics[0]

        // If accountAndAccountStatistics exists
        if (accountAndAccountStatistics !== null) {

            // What ever data is sent to the second parameter of this function will be stored in req.user
            doneCallBack(
                error, // error
                /*
                accountAndAccountStatistics is the stuff that will be stored in req.user.
                The adding of accountAndAccountStatistics to req.user should happen through a successful req.logIn call (req.logIn is added by passport.js automatically).
                The function req.logIn should technically be called within the body of this callback.
                accountAndAccountStatistics may also lead to problematic/inconsistent attribute/property/value attaining if it does not use a good naming convention.
                For example, attributes/properties with naming conventions such as USER_NAME, USERNAME, userName, etc... may not conform to this project's coding style.
                 */
                accountAndAccountStatistics,
                {message: `${accountAndAccountStatistics.username} was successfully logged in`}, // Additional info to be sent
            );
        } else {

            // If getting accountAndAccountStatistics is unsuccessful, then req.user will be null or undefined
            doneCallBack(
                error, // error
                null, // Stuff that will be stored in req.user. Since it's null, the callback should handle it appropriately
                {message: 'Error happened in passport.deserializeUser'}, // Additional info to be sent
            );
        }
    });
};

module.exports = handlerPassport;

// TODO CLEAN UP ENTIRE THING
