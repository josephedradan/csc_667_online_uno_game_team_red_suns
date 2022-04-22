/*
This file contains functions that do db calls to the engine that are
related to the game uno
 */
const debugPrinter = require('../util/debug_printer');
const db = require('../db/index');

const dbEngineGameUno = {};

async function createPlayer(user_id) {
    debugPrinter.printFunction(createPlayer.name);
    const result = await db.any(
        `
        INSERT INTO "Player" (user_id)
        VALUES ($1)
        RETURNING player_id, user_id;
        `,
        [
            user_id,
        ],
    );

    return result[0]; // Should be the new object
}

dbEngineGameUno.createPlayer = createPlayer;

/**
 * Create Game
 *
 * Reference:
 *      Insert Row into Postgresql Table with Only Default Values
 *          Notes:
 *              Insert default row
 *          Reference:
 *              https://stackoverflow.com/questions/52441909/insert-row-into-postgresql-table-with-only-default-values
 *
 * @param user_id
 * @returns {Promise<any>}
 */
async function createGame() {
    debugPrinter.printFunction(createGame.name);
    const result = await db.any(
        `
        INSERT INTO "Game" DEFAULT VALUES
        RETURNING *;
        `,
    );

    return result[0]; // Should be the new object
}

dbEngineGameUno.createGame = createGame;

/**
 * Add player using player_id to game using game_id
 *
 * @param game_id
 * @param player_id
 * @param is_host
 * @returns {Promise<any>}
 */
async function addToPlayers(game_id, player_id, is_host) {
    debugPrinter.printFunction(addToPlayers.name);
    const result = await db.any(
        `
        INSERT INTO "Players" (game_id, player_id, is_host) 
        VALUES ($1, $2, $3)
        RETURNING *;
        `,
        [
            game_id,
            player_id,
            is_host,
        ],

    );

    return result[0]; // Should be the new object
}

dbEngineGameUno.addToPlayers = addToPlayers;

// async function createCardState(game_id, player_id, is_host) {
//     debugPrinter.printFunction(createCardState.name);
//     const result = await db.any(
//         `
//         INSERT INTO "Players" (game_id, player_id, is_host)
//         VALUES ($1, $2, $3)
//         RETURNING *;
//         `,
//         [
//             game_id,
//             player_id,
//             is_host,
//         ],
//
//     );
//
//     return result[0]; // Should be the new object
// }
//
// dbEngineGameUno.createCardState = createCardState;

/**
 * Create card_state rows based on deckMulitplier
 * Notes:
 *      This function assumes that the CardInfo table is filled out correctly
 *
 * Reference:
 *      Repeat row number of times based on column value
 *          Notes:
 *              How to generate a row which would then be used with CROSS JOIN so that
 *              you can get multiples of the rows of a given table
 *
 *          Reference:
 *              https://stackoverflow.com/questions/35951514/repeat-row-number-of-times-based-on-column-value
 * @param deckMultiplier
 * @returns {Promise<any>}
 */
async function createCardStates(deckMultiplier) {
    debugPrinter.printFunction(createCardStates.name);
    const result = await db.any(
        `
        INSERT INTO "CardState" (card_info_id)
        SELECT temp.card_info_id
        FROM (
            SELECT card_info_id
            FROM "CardInfo"
            CROSS JOIN generate_series(0, $1)
        ) AS temp
        RETURNING *;
        `,
        [
            deckMultiplier,
        ],

    );

    return result[0]; // Should be the new object
}

dbEngineGameUno.createCardStates = createCardStates;

module.exports = dbEngineGameUno;
