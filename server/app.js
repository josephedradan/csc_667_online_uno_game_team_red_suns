/*

Notes:
    Automatically generate your Sequelize models from an existing database
        IMPORTANT NOTE:
            FOR THIS PROJECT, WE DO NOT USE MODELS WHEN EXECUTING QUERIES.
            QUERIES IN THIS PROJECT MUST BE MADE WITH RAW SQL QUERIES IN CODE...
            THEREFORE, YOU SHOULD IGNORE THE Notes BELOW.

            ALSO, THE MODELS FOLDER SHOULD TECHNICALLY BE IGNORED

        Notes:
            1. Make sure that you delete an unrelated or unnecessary tables in your db
            2. npm install -D sequelize-auto
            3. Mimic the example on your db

        Reference:
            Sequelize-Auto
                Notes:
                    npm package to make sequelize models from an existing database

                Reference:
                    https://www.npmjs.com/package/sequelize-auto

Reference:
    Models and Migrations
        Notes:
            Model: Class representation of a DB column
            Migration: A migration is the database table schema. You can modify the structure of the DB by adding and removing tables

        Reference:
            https://quick-adviser.com/what-is-the-difference-between-migration-and-model/
            https://www.duringthedrive.com/2017/05/06/models-migrations-sequelize-node/

    How to auto generate migrations with Sequelize CLI from Sequelize models?
        Notes:
            Migrations
        Reference:
            https://stackoverflow.com/questions/27835801/how-to-auto-generate-migrations-with-sequelize-cli-from-sequelize-models

    why application.listen should be at the end after all the requests? also why is it necessary?
        Notes:
            On the subject of application.listen at the end:
                "...mostly as a convention to useExpressMiddleware a logical and safe order of initialization where you configure the server first
                before starting it and exposing it to incoming connections.

                So ... it seems that for most normal synchronous server initialization code, it doesn't really matter whether you
                do application.listen() before or after configuring your routes. It is likely done last just as a logical convention that
                seems the appropriate order to do things (configure the server, then start the server)."

        Reference:
            https://stackoverflow.com/questions/59835089/why-app-listen-should-be-at-the-end-after-all-the-requests-also-why-is-it-neces
 */

const dotenv = require('dotenv');

dotenv.config(); // This must be at the top of all before any imports

// eslint-disable-next-line import/order
const constants = require('../config/constants');

// eslint-disable-next-line import/order
const connectionContainer = require('./server');

const {
    application,
    io,
} = connectionContainer;

const express = require('express');
const passport = require('passport');

const logger = require('morgan');

const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const { create } = require('express-handlebars');
// const handlebars = require("express-handlebars");

// eslint-disable-next-line import/order
const db = require('../db');
// const databaseSequelize = require('../models');

const expressSession = require('express-session');

const connectPGSimple = require('connect-pg-simple');

// const connectSessionSequelize = require('connect-session-sequelize');

const handlerSocketIOUseExpress = require('../controller/handler_socket_io_use_express');

const handlerPassport = require('../controller/handler_passport'); // WARNING: MAKE SURE THAT THIS IMPORT IS BEFORE ANY USAGE OF ANY PASSPORT FUNCTIONALITY

const middlewareModifyReqRes = require('../middleware/middleware_modify_req_res');
const middlewareDebug = require('../middleware/middleware_debug');

const routes = require('../routes/routes');

const debugPrinter = require('../util/debug_printer');
const middlewareExpressToSocketIO = require('../ignore/middleware_express_to_socket_io');

const gameUnoSpecial = require('../controller/game_uno_special');
const intermediateSocketIOGameUno = require('../controller/intermediate_socket_io_game_uno');

/*
##############################################################################################################
Setup and Settings
##############################################################################################################
 */

application.use(logger('dev'));
application.use(express.json());
application.use(express.urlencoded({ extended: true }));
application.use(cookieParser());
application.use(express.static(constants.dirPublic));

/* ############################## connect-session-sequelize ############################## */

/*
Connect express-session when using Sequelize

https://www.npmjs.com/package/connect-session-sequelize

 */
// const ConnectSessionSequelize = connectSessionSequelize(expressSession.Store);

// A express session store using sequelize made using connect-session-sequelize (a wrapper object)
// const sequelizeExpressSessionStore = new ConnectSessionSequelize({
//     db: databaseSequelize.sequelize,
// });

// Check if you can connect to the database
// databaseSequelize.sequelize.authenticate()
//     .then(() => {
//         debugPrinter.printBackendGreen('Database Connected');
//     })
//     .catch((err) => {
//         debugPrinter.printError(err);
//     });

// Sync the database models if not exists

/*

Reference:
    Model synchronization
        Notes:
            User.sync() - This creates the table if it doesn't exist (and does nothing if it already exists)

            User.sync({ force: true }) - This creates the table, dropping it first if it already existed

            User.sync({ alter: true }) - This checks what is the current state of the table in the database
            (which columns it has, what are their data types, etc), and then performs the necessary changes
            in the table to make it match the model.

        Reference:
            https://sequelize.org/docs/v6/core-concepts/model-basics/#model-synchronization
 */
// databaseSequelize.sequelize.sync({alter: true});

/* ############################## connect-pg-simple ############################## */
/*
Connect PG Simple

Notes:
    Setting up the Session Store object for the express-sessions

Reference:
    Connect PG Simple
        Notes:
            Go to the url for options for the pgSessionStore
        Reference:
            https://www.npmjs.com/package/connect-pg-simple

    Connect-pg-simple express: Failed to prune sessions: relation "session" does not exist. PostgreSQL
        Notes:
            If you get the above error, then go here
        Reference:
            https://stackoverflow.com/a/71285712
 */
const PGSessionStore = connectPGSimple(expressSession);

const pgSessionStore = new PGSessionStore({
    createTableIfMissing: true,
    pgPromise: db,
    tableName: 'Sessions',
});

/* ############################## Handle Bars ############################## */

const hbs = create({
    layoutsDir: constants.dirLayouts,
    partialsDir: constants.dirPartials,
    extname: '.hbs',
    defaultLayout: 'layout', // helpers: {
    //     emptyObject: (obj) => {
    //         return !(
    //             obj.constructor === Object && Object.keys(obj).length == 0
    //         );
    //     },
    // },
});

application.engine('hbs', hbs.engine);

// view engine setup
application.set('view engine', 'hbs');
application.set('views', constants.dirViews);

/* ############################## express-session (Must be placed after hsb to prevent unnecessary db calls) ############################## */

/*

Reference:
    When to useExpressMiddleware saveUninitialized and resave in express-session
        Notes:
            "If during the lifetime of the request the session object isn't modified then, at the end of the request
            and when saveUninitialized is false, the (still empty, because unmodified) session object will
            not be stored in the session store.

            The reasoning behind this is that this will prevent a lot of empty session objects being stored in the
            session store. Since there's nothing useful to store, the session is "forgotten" at the end of the request.

            ...

            About resave: this may have to be enabled for session stores that don't support the "touch" command. What
            this does is tell the session store that a particular session is still active, which is necessary because
            some stores will delete idle (unused) sessions after some time.

            If a session store driver doesn't implement the touch command, then you should enable resave so that even
            when a session wasn't changed during a request, it is still updated in the store (thereby marking it active).
            "

        Reference:
            https://stackoverflow.com/questions/40381401/when-to-use-saveuninitialized-and-resave-in-express-session
 */

const middlewareExpressSession = expressSession(
    {
        secret: 'SOME SECRET', // TODO: MOVE THIS TO A FILE OR SOMETHING
        resave: false, // Rewrite/Resave the res.session.cookie on every request (THIS OPTION MUST BE SET TO TRUE DUE TO THE BACKEND NOT BEING RESTFUL)
        saveUninitialized: false, // Allow saving empty/non modified session objects in session store (THIS OPTION MUST BE SET TO TRUE DUE TO THE BACKEND NOT BEING RESTFUL)
        // store: sequelizeExpressSessionStore, // Use the Store made from connect-session-sequelize
        store: pgSessionStore,
        cookie: {
            httpOnly: false, //     secure: true, // THIS REQUIRES THAT THE CONNECTION IS SECURE BY USING HTTPS (https://github.com/expressjs/session#cookiesecure)
            //     maxAge: 86400, // 1 Week long cookie
        },
    },
);

/*

Notes:
    Basically, it will add req.session.passport.user
 */
application.use(middlewareExpressSession);

// Sync the express sessions table (If the table does not exist in the database, then this will create it)
// sequelizeExpressSessionStore.sync();

/* ############################## passport (Must be placed after hsb to prevent unnecessary db calls) ############################## */
// Config passport
handlerPassport.configurePassportLocalStrategy(passport);

/*
In a Connect or Express-based application, passport.initialize() middleware is required to initialize Passport.

Notes:
    Basically, it will add req.login and req.logout

Reference:
    what is passport.initialize()? (nodejs express)
        Notes:
            "passport.session() is another middleware that alters the request object and change the 'user' value that is currently
            the session id (from the client cookie) into the true deserialized user object. It is explained in detail here."

            " With sessions, initialize() setups the functions to serialize/deserialize the user data from the request.
            You are not required to useExpressMiddleware passport.initialize() if you are not using sessions."

        Reference:
            https://stackoverflow.com/questions/46644366/what-is-passport-initialize-nodejs-express
 */
/**

 */
application.use(passport.initialize()); // Initialize password middleware

/*
If your application uses persistent login sessions, passport.session() middleware must also be used.
(Serialize and deserialize. Persist the login)

Notes:
    Basically, it will add req.user

Reference:

    What does passport.session() middleware do?
        Notes:
            "passport.session() acts as a middleware to alter the req object and change the 'user' value that is currently
            the session id (from the client cookie) into the true deserialized user object.

            ... Where it essentially acts as a middleware and alters the value of the 'user' property in the req object to contain the deserialized
            identity of the user. To allow this to work correctly you must include serializeUser and deserializeUser functions in your custom code.
            "

        Reference:
            https://stackoverflow.com/questions/22052258/what-does-passport-session-middleware-do/28994045#28994045

*/
application.use(passport.session());

/* ############################## socket.io ############################## */

/*
Apply express-session, and passport to socket.io

 */
// This will allow reading and writing to the db, basically this may or may not add socket.request.session.passport.user depending on if the session cookie exists
handlerSocketIOUseExpress.useExpressMiddleware(middlewareExpressSession);
// This will add req.login and req.logout via socket.request.login and socket.request.logout
handlerSocketIOUseExpress.useExpressMiddleware(passport.initialize());
// This will basically add req.user which is accessible via socket.request.user
handlerSocketIOUseExpress.useExpressMiddleware(passport.session());

// Setup more socket io middleware
require('./socket_io');
const dbEngineGameUno = require('../controller/db_engine_game_uno');

/* ############################## Middleware Message (Custom middlewares) ############################## */

application.use(middlewareModifyReqRes.attachMessageToResponseLocals);
application.use(middlewareModifyReqRes.attachUserToResponseLocals);

/* ############################## DEBUGGING ############################## */

// Express debugging
application.use(middlewareDebug.printDebugger('Express', 'backend_yellow'));

// Socket.io debugging
handlerSocketIOUseExpress.useExpressMiddleware(middlewareDebug.printDebugger('Socket.io', 'backend_cyan'));

/* ############################## routes ############################## */

application.use('/', routes);

/* ############################## Error handling and Special throws ############################## */

application.use((req, res, next) => {
    next(createError(404));
});

// error handler
application.use((err, req, res, next) => {
    // If the game throw a win
    if (err instanceof gameUnoSpecial.GameUnoWinner) {
        debugPrinter.printGreen(`game_id: ${err.game.game_id} has a winner`);
        intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_MessageServer_Wrapped(err.game.game_id, err.message)
            .then((result) => {
            })
            .catch((error) => {
                debugPrinter.printError('Special Error');
                debugPrinter.printError(error);
            });

        intermediateSocketIOGameUno.emitInRoom_ServerGameGameID_Object(err.game.game_id, err.getJsonResponse())
            .then((result) => {
            })
            .catch((error) => {
                debugPrinter.printError('Special Error');
                debugPrinter.printError(error);
            });

        // TODO GUARD
        dbEngineGameUno.deleteGameRow(err.game.game_id)
            .then((result) => {
            })
            .catch((error) => {
                debugPrinter.printError('Special Error');
                debugPrinter.printError(error);
            });

        res.json(err.getJsonResponse());
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

module.exports = application;
