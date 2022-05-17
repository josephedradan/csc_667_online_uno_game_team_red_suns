/*
Handle password related stuff

 */

const bcrypt = require('bcrypt');

const BCRYPT_SALT_ROUNDS = 10;

const handlerPassword = {};

/**
 * Hash password
 *
 * @param password
 * @returns {Promise<String>}
 */
async function hash(password) {
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);

    return bcrypt.hash(password, salt);
}

handlerPassword.hash = hash;

/**
 * Compare passwords
 *
 * Notes:
 *      You can do
 *      bcrypt.compare(passwordHashed, passwordNormal, cb(err, res))
 *
 * @param passwordHashed
 * @param passwordNormal
 * @returns {Promise<Boolean>}
 */
async function compare(passwordHashed, passwordNormal) {
    // console.log(`inside compare; ${passwordHashed} : ${passwordNormal}`);
    return bcrypt.compare(passwordHashed, passwordNormal);
}

handlerPassword.compare = compare;

module.exports = handlerPassword;
