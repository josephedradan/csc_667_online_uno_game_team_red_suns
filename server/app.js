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
 */

const {app, io} = require("./server")

const createError = require("http-errors");
const express = require("express");
const passport = require('passport');

const cookieParser = require("cookie-parser");
const logger = require("morgan");
const {create} = require("express-handlebars");
// const handlebars = require("express-handlebars");

const expressSession = require('express-session');


if (process.env.NODE_ENV === "development") {
    require("dotenv").config();
}

// const db = require("./db/testDB");

const databaseSequelize = require('../models');
const handlerPassport = require('../controller/handler_passport');
const middlewareCommunicateToFrontend = require('../middleware/middleware_communicate_to_frontend')

const debugPrinter = require("../util/debug_printer");

const routes = require("../routes/routes");
const constants = require("./constants");

/*
##############################################################################################################
Setup and Settings
##############################################################################################################
 */

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(constants.dirPublic));

/*############################## connect-session-sequelize ##############################*/

/*
Connect express-session when using Sequelize

https://www.npmjs.com/package/connect-session-sequelize

 */
const ConnectSessionSequelize = require('connect-session-sequelize')(
    expressSession.Store,
);

// A express session store using sequelize made using connect-session-sequelize (a wrapper object)
const sequelizeExpressSessionStore = new ConnectSessionSequelize({
    db: databaseSequelize.sequelize,
});

// Check if you can connect to the database
databaseSequelize.sequelize.authenticate()
    .then(() => {
        debugPrinter.printBackendGreen('Database Connected');
    })
    .catch((err) => {
        debugPrinter.printError(err);
    });

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


/*############################## Handle Bars ##############################*/

const hbs = create({
    layoutsDir: constants.dirLayouts ,
    partialsDir: constants.dirPartials,
    extname: ".hbs",
    defaultLayout: "layout",
    // helpers: {
    //     emptyObject: (obj) => {
    //         return !(
    //             obj.constructor === Object && Object.keys(obj).length == 0
    //         );
    //     },
    // },
});

app.engine("hbs", hbs.engine);

// view engine setup
app.set("view engine", "hbs");
app.set("views", constants.dirViews);

/*############################## express-session (Must be placed after hsb to prevent unnecessary db calls) ##############################*/

/*

Reference:
    When to use saveUninitialized and resave in express-session
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
app.use(
    expressSession({
        secret: "SOME SECRET", // TODO: MOVE THIS TO A FILE OR SOMETHING
        resave: false, // Rewrite/Resave the res.session.cookie on every request (THIS OPTION MUST BE SET TO TRUE DUE TO THE BACKEND NOT BEING RESTFUL)
        saveUninitialized: false, // Allow saving empty/non modified session objects in session store (THIS OPTION MUST BE SET TO TRUE DUE TO THE BACKEND NOT BEING RESTFUL)
        store: sequelizeExpressSessionStore, // Use the Store made from connect-session-sequelize
        cookie: {
            httpOnly: false,
            //     secure: true, // THIS REQUIRES THAT THE CONNECTION IS SECURE BY USING HTTPS (https://github.com/expressjs/session#cookiesecure)
            //     maxAge: 86400, // 1 Week long cookie
        },
    }),
);

// Sync the express sessions table (If the table does not exist in the database, then this will create it)
sequelizeExpressSessionStore.sync();

/*############################## passport (Must be placed after hsb to prevent unnecessary db calls) ##############################*/
// Config passport
handlerPassport.configurePassportLocalStrategy(passport);

// In a Connect or Express-based application, passport.initialize() middleware is required to initialize Passport.
app.use(passport.initialize()); // Initialize password middleware

/*
If your application uses persistent logIn sessions, passport.session() middleware must also be used.
(Serialize and deserialize. Persist the logIn)
*/
app.use(passport.session());

/*############################## Middleware Message (Custom middlewares) ##############################*/

app.use(middlewareCommunicateToFrontend.middlewareMessage);
app.use(middlewareCommunicateToFrontend.middlewarePersistUser);

/*############################## DEBUGGING ##############################*/

app.use((req, res, next) => {
    if (process.env.NODE_ENV === "development") {
        debugPrinter.printRequest("--- DEBUGGING MIDDLEWARE START ---")

        debugPrinter.printBackendGreen("req.url")
        debugPrinter.printDebug(req.url)
        debugPrinter.printBackendGreen("req.body")
        debugPrinter.printDebug(req.body)
        debugPrinter.printBackendGreen("req.user")
        debugPrinter.printDebug(req.user)

        debugPrinter.printRequest("--- DEBUGGING MIDDLEWARE END ---")

    }

    next()
})

/*############################## routes ##############################*/

app.use("/", routes);


/*############################## Error handling ##############################*/

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    debugPrinter.printError(err)

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});


module.exports = app;
