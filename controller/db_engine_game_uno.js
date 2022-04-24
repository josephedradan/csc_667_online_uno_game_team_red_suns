/*
This file contains functions that do db calls to the engine that are
related to the game uno
 */
const debugPrinter = require('../util/debug_printer');
const db = require('../db/index');

const dbEngineGameUno = {};

/**
 * Notes:
 *      Acceptable values: blue, green, yellow, red
 * @param username
 * @returns {Promise<any[]>}
 */
async function getCardInfoRowByColor(color) {
    debugPrinter.printFunction(getCardInfoRowByColor.name);
    const result = await db.any(
        `
        SELECT card_info_id, type, content, color
        FROM "CardInfo" WHERE color = $1;
        `,
        [
            color,
        ],
    );
    return result[0];
}

dbEngineGameUno.getCardInfoRowByColor = getCardInfoRowByColor;

/**
 * Notes:
 *      Acceptable values: NUMBER, SPECIAL
 *
 * @param type
 * @returns {Promise<any[]>}
 */
async function getCardInfoRowByType(type) {
    debugPrinter.printFunction(getCardInfoRowByType.name);
    const result = await db.any(
        `
        SELECT card_info_id, type, content, color
        FROM "CardInfo" 
        WHERE type = $1;
        `,
        [
            type,
        ],
    );
    return result[0];
}

dbEngineGameUno.getCardInfoRowByType = getCardInfoRowByType;

async function getCardInfoRows() {
    debugPrinter.printFunction(getCardInfoRows.name);
    const result = await db.any(
        `
        SELECT * 
        FROM "CardInfo"
        `,
    );
    return result;
}

dbEngineGameUno.getCardInfoRows = getCardInfoRows;

/**
 * Create Player row based on user_id
 *
 * @param user_id
 * @returns {Promise<any>}
 */
async function createPlayerRow(user_id) {
    debugPrinter.printFunction(createPlayerRow.name);
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

dbEngineGameUno.createPlayerRow = createPlayerRow;

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
async function createGameRow() {
    debugPrinter.printFunction(createGameRow.name);
    const result = await db.any(
        `
        INSERT INTO "Game" DEFAULT VALUES
        RETURNING *;
        `,
    );

    return result[0];
}

dbEngineGameUno.createGameRow = createGameRow;

/**
 * Add player using player_id to game using game_id
 *
 * @param game_id
 * @param player_id
 * @param is_host
 * @returns {Promise<any>}
 */
async function createPlayersRow(game_id, player_id, is_host) {
    debugPrinter.printFunction(createPlayersRow.name);
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

    return result[0];
}

dbEngineGameUno.createPlayersRow = createPlayersRow;

/**
 * Create CardState rows based on deckMultiplier
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
async function createCardStateRows(deckMultiplier) {
    debugPrinter.printFunction(createCardStateRows.name);
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

    return result;
}

// dbEngineGameUno.createCardStateRows = createCardStateRows; // Don't use this

/**
 * Create CardState rows and Cards rows at the same time
 *
 * Notes:
 *      Inserts rows for Cards based on the inserted rows from CardState
 *
 * Reference:
 *     Repeat row number of times based on column value
 *          Notes:
 *              How to generate a row which would then be used with CROSS JOIN so that
 *              you can get multiples of the rows of a given table
 *
 *          Reference:
 *              https://stackoverflow.com/questions/35951514/repeat-row-number-of-times-based-on-column-value
 *
 *      Postgres insert into table multiple return values from with rows as
 *          Notes:
 *              Example using:
 *                  WITH rows AS
 *
 *          Reference:
 *              https://stackoverflow.com/questions/28413856/postgres-insert-into-table-multiple-return-values-from-with-rows-as
 *
 *      Can I use return value of INSERT...RETURNING in another INSERT?
 *         Notes:
 *              Example using:
 *                  WITH rows AS
 *
 *         Reference:
 *              https://stackoverflow.com/questions/6560447/can-i-use-return-value-of-insert-returning-in-another-insert
 *
 * @param game_id
 * @param deckMultiplier
 * @returns {Promise<any>}
 */
async function createCardStateRowsAndCardsRows(game_id, deckMultiplier) {
    debugPrinter.printFunction(createCardStateRowsAndCardsRows.name);
    const result = await db.any(
        `
        WITH cardStateRows AS (
            INSERT INTO "CardState" (card_info_id)
            SELECT temp.card_info_id
            FROM (
                SELECT card_info_id
                FROM "CardInfo"
                CROSS JOIN generate_series(1, $1)
            ) AS temp
            RETURNING *
        ), cardsRows AS(
            INSERT INTO "Cards" (game_id, card_state_id)
            SELECT $2, cardStateRows.card_state_id
            FROM cardStateRows
            RETURNING *
        )
        SELECT 
            cardsRows.game_id, 
            cardStateRows.card_state_id, 
            cardStateRows.card_info_id
        FROM cardsRows
        LEFT JOIN cardStateRows ON cardsRows.card_state_id = cardStateRows.card_state_id;
        `,
        [
            deckMultiplier,
            game_id,
        ],
    );

    return result;
}

dbEngineGameUno.createCardStateRowsAndCardsRows = createCardStateRowsAndCardsRows;

/**
 * Create Collection Row based on card_state_id, collection_info_id, collection_index
 *
 * Notes:
 *      This function is made primarily because shuffling the indies of the CardState Rows is difficult, so the job
 *      is off loaded to JS
 *
 * @param card_state_id
 * @param collection_info_id
 * @param collection_index
 * @returns {Promise<void>}
 */
async function createCollectionRow(card_state_id, collection_info_id, collection_index) {
    const result = await db.any(
        `
        INSERT INTO "Collection" (card_state_id, collection_info_id, collection_index)
        SELECT $1, $2, $3
        FROM cardStateRows
        RETURNING *
        `,
        [
            card_state_id,
            collection_info_id,
            collection_index,
        ],
    );

    return result[0];
}

dbEngineGameUno.createCollectionRow = createCollectionRow;

/**
 * Create CardState Rows, Collection Rows, and Cards Rows for a game_id
 *
 * IMPORTANT NOTES:
 *      This will set the collection_index of all Collection Rows as 0
 *
 * Notes:
 *      Create CardState Rows
 *          Create CardState Rows based on CardState.card_state_id and CardInfo.card_info_id
 *          Create Collection Rows based on CardState.card_state_id and CollectionInfo.collection_info_id
 *          Create Cards Rows based on CardState.card_state_id and Game.game_id
 *
 * @param game_id
 * @param deckMultiplier
 * @returns {Promise<any[]>}
 */
async function createCardStateRowsAndCardsRowsAndCollectionRows(game_id, deckMultiplier) {
    debugPrinter.printFunction(createCardStateRowsAndCardsRows.name);
    const result = await db.any(
        `
        WITH cardStateRows AS (
            INSERT INTO "CardState" (card_info_id)
            SELECT temp.card_info_id
            FROM (
                SELECT card_info_id
                FROM "CardInfo"
                CROSS JOIN generate_series(1, $1)
                ) AS temp
            RETURNING *
        ), collectionRows AS (
            INSERT INTO "Collection" (card_state_id, collection_info_id, collection_index)
            SELECT card_state_id, 1, 0
            FROM cardStateRows
            RETURNING *
        ), cardsRows AS(
            INSERT INTO "Cards" (game_id, card_state_id)
            SELECT $2, cardStateRows.card_state_id
            FROM cardStateRows
            RETURNING *
        )
        SELECT 
            cardsRows.game_id, 
            cardStateRows.card_state_id, 
            cardStateRows.card_info_id, 
            collectionRows.collection_info_id, 
            collectionRows.player_id,
            collectionRows.collection_index
        FROM cardsRows
        LEFT JOIN cardStateRows ON cardsRows.card_state_id = cardStateRows.card_state_id
        LEFT JOIN collectionRows ON cardsRows.card_state_id = collectionRows.card_state_id;
        `,
        [
            deckMultiplier,
            game_id,
        ],
    );

    return result;
}

// dbEngineGameUno.createCardStateRowsAndCardsRowsAndCollectionRows = createCardStateRowsAndCardsRowsAndCollectionRows; // Don't use this

async function getGameRowByGameID(game_id) {
    debugPrinter.printFunction(getGameRowByGameID.name);
    const result = await db.any(
        `
        SELECT *
        FROM "Game"
        WHERE "Game".game_id=$1
        `,
        [
            game_id,
        ],
    );

    return result;
}

dbEngineGameUno.getGameRowByGameID = getGameRowByGameID;

async function createMessageRow(game_id, player_id, message) {
    debugPrinter.printFunction(createMessageRow.name);
    const result = await db.any(
        `
        INSERT INTO "Message" (game_id, player_id, message)
        VALUES ($1, $2, $3)
        RETURNING *;
        `,
        [
            game_id,
            player_id,
            message,
        ],
    );

    return result[0];
}

dbEngineGameUno.createMessageRow = createMessageRow;

async function getMessageRowsByGameID(game_id) {
    debugPrinter.printFunction(getMessageRowsByGameID.name);
    const result = await db.any(
        `
        SELECT * 
        From "Message"
        WHERE "Message".game_id = $1
        `,
        [
            game_id,
        ],
    );

    return result;
}

dbEngineGameUno.getMessageRowsByGameID = getMessageRowsByGameID;

module.exports = dbEngineGameUno;
