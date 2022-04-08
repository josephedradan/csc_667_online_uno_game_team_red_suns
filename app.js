const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const { create } = require("express-handlebars");
const bodyParser = require("body-parser"); 
// const handlebars = require("express-handlebars");

if (process.env.NODE_ENV === "development") {
    require("dotenv").config();
}

// const db = require("./db/testDB");

const routes = require("./routes/routes");

/*############################## Settings ##############################*/

const app = express();

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
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", routes);


/*############################## Error Handling ##############################*/

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
