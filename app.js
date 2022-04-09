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
            Model: The structure of a table in the DB
            Migration: Modifies the structure of the DB by adding and removing tables

 */
const createError = require("http-errors");
const express = require("express");
const passport = require('passport');

const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const {create} = require("express-handlebars");
// const handlebars = require("express-handlebars");

const expressSession = require('express-session');


if (process.env.NODE_ENV === "development") {
    require("dotenv").config();
}


// const db = require("./db/testDB");

const databaseSequelize = require('./models');
const handlerPassport = require('./controller/handler_passport');
const debugPrinter = require("./util/debug_printer");

const routes = require("./routes/routes");

/*
##############################################################################################################
Settings
##############################################################################################################
 */
const app = express();

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

/*############################## express-session ##############################*/

app.use(
    expressSession({
        secret: "SOME SECRET", // TODO: MOVE THIS TO A FILE OR SOMETHING
        resave: false, // Resave when nothing is changed
        saveUninitialized: false, // Save empty value in the session
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

/*############################## passport ##############################*/
// Config passport
handlerPassport.configurePassportLocalStrategy(passport);

// In a Connect or Express-based application, passport.initialize() middleware is required to initialize Passport.
app.use(passport.initialize()); // Initialize password middleware

/*
If your application uses persistent login sessions, passport.session() middleware must also be used.
(Serialize and deserialize. Persist the login)
*/
app.use(passport.session());

/*############################## Handle Bars ##############################*/

const hbs = create({
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
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
app.set("views", path.join(__dirname, "views"));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", routes);


/*
##############################################################################################################
Error Handling
##############################################################################################################
 */
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
