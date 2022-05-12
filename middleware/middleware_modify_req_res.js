/*
Middleware that uses express-session to send a message to client through their next request because the backend is not a REST API

Notes:
    Due to the backend being limited to using redirect and render and not json as a response,
    this middleware is created to allow for messages to be sent from the backend to the frontend
    via express-session following a client's redirect or render request.

    Basically, send a custom message to the frontend on their next request. Their next request should be a
    from a redirect or render from the backend.

Reference:
    Flash messages with Node.js, Express and Bootstrap
        Notes:
            This is what the below code was based on
        Reference:
            https://youtu.be/T4Y3dj1nysk?t=1317

 */

const middlewareModifyReqRes = {};

/**
 * Add a message (which in this case should be an object) so the frontend can deal with it
 * Notes:
 *      Process:
 *          1. Get the message from the session (express-session)
 *          2. Add the message to the current request's response
 *          3. Front end must deal with it...
 *
 *      This is basically express-flash
 *
 * @param req
 * @param res
 * @param next
 */
async function attachMessageToResponseLocals(req, res, next) {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
}

middlewareModifyReqRes.attachMessageToResponseLocals = attachMessageToResponseLocals;

/**
 * Persist req.user from passport to res.locals.user
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function attachUserToResponseLocals(req, res, next) {
    res.locals.user = req.user;
    next();
}

middlewareModifyReqRes.attachUserToResponseLocals = attachUserToResponseLocals;

module.exports = middlewareModifyReqRes;
