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

const databaseSequelize = require('./config/database_sequelize');
const handlerPassport = require('./controller/handler_passport');

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
    db: databaseSequelize,
});
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
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});


module.exports = app;
