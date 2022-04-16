/*
Validation middleware for req.body

Notes:
    All functions here are middleware intended to validate req.body of all requests

Reference:
    any.warning(code, [context])
        Notes:
            Look at this:
                    const { value, warning } = await schema.validateAsync('anything', { warnings: true });
        Reference:
            https://joi.dev/api/?v=17.4.2#anywarningcode-context

*/
const to = require("await-to-js").default;

const joiSchemas = require("../controller/joi_schemas");
const debugPrinter = require("../util/debug_printer");

async function validateCommon(
    req,
    res,
    next,
    schema,
    validationCallBackError,
    _backendErrorMessage
) {
    // Values returned from validating key/value pairs form req.body call

    // Non async version
    // const {
    //     error,
    //     value,
    //     warning,
    // } = await schema.validate(req.body, { warnings: true });

    // Incorrect Async version using await-to-js
    // const [error,{
    //     value,
    //     warning,
    // }] = await to(schema.validateAsync(req.body, { warnings: true }));

    // const {value, warning } = await schema.validateAsync(req.body);

    // Correct Async version using await-to-js

    const [error, value] = await to(schema.validateAsync(req.body));

    if (error) {
        // If there was a validation error, respond with the validation error
        validationCallBackError(req, res, next);
    } else {
        // Otherwise, go to the next middleware
        next();
    }
}

const middlewareValidation = {};

function registrationValidationCallBackError(req, res, next) {
    res.render("registration", {
        title: "Registration Page",
        registration: true,
    });
}

/**
 * Middleware to validate req.body used when signing up using the joi package
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
middlewareValidation.validateAccountRegistration = async (req, res, next) => {
    await validateCommon(
        req,
        res,
        next,
        joiSchemas.SCHEMA_ACCOUNT_REGISTRATION,
        registrationValidationCallBackError,
        "ERROR IN validateAccountRegistration"
    );
};

function loginValidationCallBackError(req, res, next) {
    res.render("index");
}

/**
 *  Middleware to validate req.body used when logging in using the joi package
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
middlewareValidation.validateAccountLogin = async (req, res, next) => {
    await validateCommon(
        req,
        res,
        next,
        joiSchemas.SCHEMA_ACCOUNT_LOGIN,
        loginValidationCallBackError,
        "ERROR IN validateAccountLogin"
    );
};

middlewareValidation.validateAccountUpdate = async (req, res, next) => {
    await validateCommon(
        req,
        res,
        next,
        joiSchemas.SCHEMA_ACCOUNT_UPDATE,
        "ERROR IN validateAccountUpdate"
    );
};

module.exports = middlewareValidation;
