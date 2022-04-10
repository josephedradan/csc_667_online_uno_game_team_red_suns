const db = require("../db/index");


async function logOut(req, res, next) {
    // Get username (It will not exist in the session once you logout)
    const {username} = req.user;

    // Will log out user (this functionality is handled by the passport package)
    req.logOut();

    // Remove the session of the user
    req.session.destroy();

    // Clear the users cookies
    res
        .status(200)
        .clearCookie('connect.sid')
        .json({
            status: 'success',
            message: `${username} has logged out`,
        });
}

/* ############################################################################################################## */

const controllerIndex = {}

controllerIndex.renderIndex = (req, res, next) => {
    res.render("index", {title: "CSC 667 Express"})
}


controllerIndex.renderRegistration = (req, res, next) => {
    res.render("registration", {title: "Registration Page"});
}


// FIXME: REMOVE ME ONCE DONE OR MOVE ME
controllerIndex.testDB = async (request, response, next) => {
    const baseSQL = `SELECT * FROM USERS;`;

    let rows = await db.any(baseSQL);
    if (!rows) {
        // throw error here. need error class to generate logs.
    }
    // add further logic here.
    // console.log(rows);
    response.json(rows);
}

/**
 * Login user based on the passport package
 *
 * Notes:
 *      *** The actual login of the user is handled by the middleware passport.authenticate('local')
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
controllerIndex.login = async (req, res, next) => {
    /*
    The functionality of this function has been moved to middleware_passport.js to allow for
    different strategies for logging in to be supported.
    This function now has no purpose and will never be called as middleware_passport.js will call res
    meaning any next() to this function is not possible.
    Therefore, anything in this function should not work.
     */

    console.log('NO ONE WILL SEE THIS MESSAGE.');
};

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
controllerIndex.logout = async (req, res, next) => {
    // if (process.env.NODE_ENV === 'development') {
    //     debugPrinter.printMiddleware('Logout');
    //     debugPrinter.printFunction(
    //         `${req.route.stack[0].method}: ${req.route.path}`,
    //     );
    // }
    try {
        // Log out user
        await logOut(req, res, next);
    } catch (error) {
        next(error);
    }
};

module.exports = controllerIndex;
