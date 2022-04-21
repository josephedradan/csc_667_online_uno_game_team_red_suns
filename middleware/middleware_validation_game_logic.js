const middlewareValidationGameLogic = {};

/**
 * Validate if the req.body is correct using joi
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function validateRequestBody(req, res, next) {
    next();
}

middlewareValidationGameLogic.validateRequestBody = validateRequestBody;

/**
 * Check if the player can execute an action.
 * Basically, if it's the player's turn, then allow them to do the action
 * else send JSON saying they can't do that.
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function checkIfPlayerCanDoAction(req, res, next) {
    next();
}

middlewareValidationGameLogic.checkIfPlayerCanDoAction = checkIfPlayerCanDoAction;

/**
 * Check if the player is a player in the game, this is to prevent non players from doing actions.
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function checkIfPlayerIsPlayerInGame(req, res, next) {
    next();
}

middlewareValidationGameLogic.checkIfPlayerIsPlayerInGame = checkIfPlayerIsPlayerInGame;
module.exports = middlewareValidationGameLogic;
