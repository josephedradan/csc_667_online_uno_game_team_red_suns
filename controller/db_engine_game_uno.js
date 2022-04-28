/*
This file contains functions that do db calls to the engine that are
related to the game uno

Notes:
    Do not use db.one because returning nothing is not an error

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

async function getUserByPlayerID(player_id) {
    debugPrinter.printFunction(getUserByPlayerID.name);
    const result = await db.any(
        `
        SELECT *
        FROM "User"
        JOIN "Player" ON "User".user_id = "Player".user_id
        WHERE "Player".player_id = $1
        `,
        [
            player_id,
        ],
    );

    return result[0]; // Should be the new object
}

dbEngineGameUno.getUserByPlayerID = getUserByPlayerID;

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

async function createPlayerRowAndCreatePlayersRow(user_id, game_id, is_host) {
    debugPrinter.printFunction(createPlayerRow.name);
    const result = await db.any(
        `
        WITH playerRow AS(
            INSERT INTO "Player" (user_id)
            VALUES ($1)
            RETURNING *
        ), playersRow AS(
            INSERT INTO "Players" (game_id, player_id, is_host) 
            SELECT $2, playerRow.player_id, $3
            FROM playerRow
            RETURNING *
        )
        SELECT *
        FROM playerRow
        JOIN playersRow ON playerRow.player_id = playersRow.player_id
        `,
        [
            user_id, game_id, is_host,
        ],
    );

    return result[0]; // Should be the new object
}
dbEngineGameUno.createPlayerRowAndCreatePlayersRow = createPlayerRowAndCreatePlayersRow;

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
 *      Can I useExpressMiddleware return value of INSERT...RETURNING in another INSERT?
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
        VALUES ($1, $2, $3)
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
 * Create CardState Rows, Collection Rows, and Cards Rows for a game_id without randomizing the Collection.collection_index
 * for each newly created Collection.card_state_id based on the given game_id
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
                CROSS JOIN generate_series(1, $2)
                ) AS temp
            RETURNING *
        ), collectionRows AS (
            INSERT INTO "Collection" (card_state_id, collection_info_id, collection_index)
            SELECT card_state_id, 1, 0
            FROM cardStateRows
            RETURNING *
        ), cardsRows AS(
            INSERT INTO "Cards" (game_id, card_state_id)
            SELECT $1, cardStateRows.card_state_id
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
            game_id,
            deckMultiplier,
        ],
    );

    return result;
}

// dbEngineGameUno.createCardStateRowsAndCardsRowsAndCollectionRows = createCardStateRowsAndCardsRowsAndCollectionRows; // Don't use this

/**
 * Create CardState Rows, Collection Rows, and Cards Rows for a game_id
 *
 *
 * Notes:
 *      Create CardState Rows
 *          Create CardState Rows based on CardState.card_state_id and CardInfo.card_info_id
 *          Create Collection Rows based on CardState.card_state_id and CollectionInfo.collection_info_id
 *          Create Cards Rows based on CardState.card_state_id and Game.game_id
 *
 *      Will randomized Collection.collection_index for newly created CardState.card_state_id for the given game_id
 *
 * @param game_id
 * @param deckMultiplier
 * @returns {Promise<any[]>}
 */
async function createCardStateRowsAndCardsRowsAndCollectionRowsWithCollectionRandomized(game_id, deckMultiplier) {
    debugPrinter.printFunction(createCardStateRowsAndCardsRows.name);
    const result = await db.any(
        `
        WITH cardStateRows AS (
            INSERT INTO "CardState" (card_info_id)
            SELECT temp.card_info_id
            FROM (
                SELECT card_info_id
                FROM "CardInfo"
                CROSS JOIN generate_series(1, $2)
                ) AS temp
            RETURNING *
        ), cardStateRowsRandom AS(
            SELECT *
            FROM cardStateRows
            ORDER BY RANDOM()
        ), cardStateRowsRandomWithRow AS(
            SELECT *, ROW_NUMBER() OVER() AS row_number
            FROM cardStateRowsRandom
        ), collectionRows AS (
            INSERT INTO "Collection" (card_state_id, collection_info_id, collection_index)
            SELECT card_state_id, 1, cardStateRowsRandomWithRow.row_number - 1
            FROM cardStateRowsRandomWithRow
            RETURNING *
        ), cardsRows AS(
            INSERT INTO "Cards" (game_id, card_state_id)
            SELECT $1, cardStateRows.card_state_id
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
        LEFT JOIN collectionRows ON cardsRows.card_state_id = collectionRows.card_state_id
        ORDER BY collectionRows.collection_index;
        `,
        [
            game_id,
            deckMultiplier,
        ],
    );

    return result;
}

dbEngineGameUno.createCardStateRowsAndCardsRowsAndCollectionRowsWithCollectionRandomized = createCardStateRowsAndCardsRowsAndCollectionRowsWithCollectionRandomized;

/**
 * Randomize Collection (HAND) by game_id and player_id
 *
 * Reference:
 *      How can I copy data from one column to another in the same table?
 *          Notes:
 *              UPDATE table SET columnB = columnA;
 *          Reference:
 *              https://stackoverflow.com/questions/6308594/how-can-i-copy-data-from-one-column-to-another-in-the-same-table
 *
 *      Joining a series in postgres with a select query
 *          Notes:
 *              Can't join with generate_series(), so you must use ROW_NUMBER() OVER()
 *              Also, this avoids doing a for or a for each loop
 *
 *              Example:
 *                  select row_number() over() as rn, a
 *                  from (
 *                      select a
 *                      from foo
 *                      order by random()
 *                      limit 50
 *                  ) s
 *                  order by rn;
 *
 *      SQL update records with ROW_NUMBER()
 *          Notes:
 *              Example:
 *                  update cards c
 *                  set position = c2.seqnum
 *                  from (select c2.*, row_number() over () as seqnum
 *                        from cards c2
 *                       ) c2
 *                  where c2.pkid = c.pkid;
 *
 *          Reference:
 *              https://stackoverflow.com/questions/41069860/sql-update-records-with-row-number
 *
 * @param game_id
 * @param player_id
 * @returns {Promise<any>}
 */
async function randomizeCollectionByGameIDAndPlayerID(game_id, player_id) {
    debugPrinter.printFunction(randomizeCollectionByGameIDAndPlayerID.name);
    const result = await db.any(
        `
        WITH cardsRows AS(
            SELECT game_id, "Collection".card_state_id
            FROM "Collection"
            JOIN "Cards" ON "Collection".card_state_id = "Cards".card_state_id
            WHERE "Cards".game_id = $1
            ORDER BY RANDOM()
        ), cardsRowsRandomized AS(
            SELECT *, ROW_NUMBER() OVER() AS row_number
            FROM cardsRows
        ), cardsRowsUpdated AS(
            UPDATE "Collection"
            SET collection_index = cardsRowsRandomized.row_number - 1
            FROM cardsRowsRandomized
            WHERE cardsRowsRandomized.game_id = $1
            AND cardsRowsRandomized.card_state_id = "Collection".card_state_id
            AND "Collection".player_id = $2
            RETURNING *
        )
        SELECT 
            "Cards".game_id,
            "CardInfo".type AS card_info_type,
            "CardInfo".color AS card_color,
            "CardInfo".content AS card_content,
            "Collection".player_id,
            "Collection".collection_index,
            "Collection".card_state_id,
            "Collection".collection_info_id,
            "CardState".card_info_id,
            "CollectionInfo".type AS collection_info_type
        FROM "Collection"
        JOIN "Cards" ON "Collection".card_state_id = "Cards".card_state_id
        JOIN "CardState" ON "Collection".card_state_id = "CardState".card_state_id
        JOIN "CardInfo" ON "CardInfo".card_info_id = "CardState".card_info_id
        JOIN "CollectionInfo" ON "CollectionInfo".collection_info_id = "Collection".collection_info_id
        WHERE "Cards".game_id = $1
        AND "Collection".player_id = $2
        ORDER BY "Collection".collection_index
        `,
        [
            game_id,
            player_id,
        ],
    );

    return result;
}

dbEngineGameUno.randomizeCollectionByGameIDAndPlayerID = randomizeCollectionByGameIDAndPlayerID;

/**
 * Randomize Collection (DRAW | PLAY | HAND) by game_id and collection_info_id
 *
 *
 * @param game_id
 * @param collection_info_id
 * @returns {Promise<any>}
 */
async function randomizeCollectionByGameIDAndCollectionInfoID(game_id, collection_info_id) {
    debugPrinter.printFunction(randomizeCollectionByGameIDAndCollectionInfoID.name);
    const result = await db.any(
        `
        WITH cardsRows AS(
            SELECT game_id, "Collection".card_state_id
            FROM "Collection"
            JOIN "Cards" ON "Collection".card_state_id = "Cards".card_state_id
            WHERE "Cards".game_id = $1
            ORDER BY RANDOM()
        ), cardsRowsRandomized AS(
            SELECT *, ROW_NUMBER() OVER() AS row_number
            FROM cardsRows
        ), cardsRowsUpdated AS(
            UPDATE "Collection"
            SET collection_index = cardsRowsRandomized.row_number - 1
            FROM cardsRowsRandomized
            WHERE cardsRowsRandomized.game_id = $1
            AND cardsRowsRandomized.card_state_id = "Collection".card_state_id
            AND "Collection".collection_info_id = $2
            RETURNING *
        )
        SELECT 
            "Cards".game_id,
            "CardInfo".type AS card_info_type,
            "CardInfo".color AS card_color,
            "CardInfo".content AS card_content,
            "Collection".player_id,
            "Collection".collection_index,
            "Collection".card_state_id,
            "Collection".collection_info_id,
            "CardState".card_info_id,
            "CollectionInfo".type AS collection_info_type
        FROM "Collection"
        JOIN "Cards" ON "Collection".card_state_id = "Cards".card_state_id
        JOIN "CardState" ON "Collection".card_state_id = "CardState".card_state_id
        JOIN "CardInfo" ON "CardInfo".card_info_id = "CardState".card_info_id
        JOIN "CollectionInfo" ON "CollectionInfo".collection_info_id = "Collection".collection_info_id
        WHERE "Cards".game_id = $1
        AND "Collection".collection_info_id = $2
        ORDER BY "Collection".collection_index
        `,
        [
            game_id,
            collection_info_id,
        ],
    );

    return result;
}

dbEngineGameUno.randomizeCollectionByGameIDAndCollectionInfoID = randomizeCollectionByGameIDAndCollectionInfoID;

/**
 * Randomize Collection (DRAW | PLAY | HAND) by game_id
 *
 * @param game_id
 * @returns {Promise<any>}
 */
async function randomizeCollectionByGameID(game_id) {
    debugPrinter.printFunction(randomizeCollectionByGameID.name);
    const result = await db.any(
        `
        WITH cardsRows AS(
            SELECT game_id, "Collection".card_state_id
            FROM "Collection"
            JOIN "Cards" ON "Collection".card_state_id = "Cards".card_state_id
            WHERE "Cards".game_id = $1
            ORDER BY RANDOM()
        ), cardsRowsRandomized AS(
            SELECT *, ROW_NUMBER() OVER() AS row_number
            FROM cardsRows
        ), cardsRowsUpdated AS(
            UPDATE "Collection"
            SET collection_index = cardsRowsRandomized.row_number - 1
            FROM cardsRowsRandomized
            WHERE cardsRowsRandomized.game_id = $1
            AND cardsRowsRandomized.card_state_id = "Collection".card_state_id
            RETURNING *
        )
        SELECT 
            "Cards".game_id,
            "CardInfo".type AS card_info_type,
            "CardInfo".color AS card_color,
            "CardInfo".content AS card_content,
            "Collection".player_id,
            "Collection".collection_index,
            "Collection".card_state_id,
            "Collection".collection_info_id,
            "CardState".card_info_id,
            "CollectionInfo".type AS collection_info_type
        FROM "Collection"
        JOIN "Cards" ON "Collection".card_state_id = "Cards".card_state_id
        JOIN "CardState" ON "Collection".card_state_id = "CardState".card_state_id
        JOIN "CardInfo" ON "CardInfo".card_info_id = "CardState".card_info_id
        JOIN "CollectionInfo" ON "CollectionInfo".collection_info_id = "Collection".collection_info_id
        WHERE "Cards".game_id = $1
        ORDER BY "Collection".collection_index
        `,
        [
            game_id,
        ],
    );

    return result;
}

dbEngineGameUno.randomizeCollectionByGameID = randomizeCollectionByGameID;

async function getGameRowByGameID(game_id) {
    debugPrinter.printFunction(getGameRowByGameID.name);
    const result = await db.any(
        `
        SELECT *
        FROM "Game"
        WHERE "Game".game_id = $1
        `,
        [
            game_id,
        ],
    );

    return result[0];
}

/**
 * Get all games
 *
 * @param
 * @returns {Promise<any[]>}
 */
async function getGameRows() {
    debugPrinter.printFunction(getGameRows.name);

    const result = await db.any(
        `
        SELECT *
        FROM "Game"
        ORDER BY game_id DESC;
        `,
    );

    return result;
}

dbEngineGameUno.getGameRows = getGameRows;

dbEngineGameUno.getGameRowByGameID = getGameRowByGameID;

/**
 * Get Collection by game_id
 *
 * Notes:
 *      Basically, get all cards in the game
 *
 * @param game_id
 * @returns {Promise<any[]>}
 */
async function getCollectionByGameID(game_id) {
    debugPrinter.printFunction(getCollectionByGameID.name);
    const result = await db.any(
        `
        SELECT 
            "Cards".game_id,
            "CardInfo".type AS card_info_type,
            "CardInfo".color AS card_color,
            "CardInfo".content AS card_content,
            "Collection".player_id,
            "Collection".collection_index,
            "Collection".card_state_id,
            "Collection".collection_info_id,
            "CardState".card_info_id,
            "CollectionInfo".type AS collection_info_type
        FROM "Collection"
        JOIN "Cards" ON "Collection".card_state_id = "Cards".card_state_id
        JOIN "CardState" ON "Collection".card_state_id = "CardState".card_state_id
        JOIN "CardInfo" ON "CardInfo".card_info_id = "CardState".card_info_id
        JOIN "CollectionInfo" ON "CollectionInfo".collection_info_id = "Collection".collection_info_id
        WHERE "Cards".game_id = $1
        ORDER BY "Collection".collection_index
        `,
        [
            game_id,
        ],
    );

    return result;
}

dbEngineGameUno.getCollectionByGameID = getCollectionByGameID;

/**
 * Get Collection by player_id
 *
 * Notes:
 *      Basically, get all cards of a player
 *
 * @param player_id
 * @returns {Promise<any[]>}
 */
async function getCollectionByPlayerID(player_id) {
    debugPrinter.printFunction(getCollectionByGameID.name);
    const result = await db.any(
        `
        SELECT 
            "Cards".game_id,
            "CardInfo".type AS card_info_type,
            "CardInfo".color AS card_color,
            "CardInfo".content AS card_content,
            "Collection".player_id,
            "Collection".collection_index,
            "Collection".card_state_id,
            "Collection".collection_info_id,
            "CardState".card_info_id,
            "CollectionInfo".type AS collection_info_type
        FROM "Collection"
        JOIN "Cards" ON "Collection".card_state_id = "Cards".card_state_id
        JOIN "CardState" ON "Collection".card_state_id = "CardState".card_state_id
        JOIN "CardInfo" ON "CardInfo".card_info_id = "CardState".card_info_id
        JOIN "CollectionInfo" ON "CollectionInfo".collection_info_id = "Collection".collection_info_id
        WHERE "Collection".player_id = $1
        ORDER BY "Collection".collection_index
        `,
        [
            player_id,
        ],
    );

    return result;
}

dbEngineGameUno.getCollectionByPlayerID = getCollectionByPlayerID;

/**
 * Get Collection by game_id and collection_info_id
 *
 * Notes:
 *      Basically, get the cards of either (DRAW | PLAY | HAND)
 *
 * @param game_id
 * @param collection_info_id
 * @returns {Promise<any[]>}
 */
async function getCollectionByGameIDAndCollectionInfoID(game_id, collection_info_id) {
    debugPrinter.printFunction(getCollectionByGameID.name);
    const result = await db.any(
        `
        SELECT 
            "Cards".game_id,
            "CardInfo".type AS card_info_type,
            "CardInfo".color AS card_color,
            "CardInfo".content AS card_content,
            "Collection".player_id,
            "Collection".collection_index,
            "Collection".card_state_id,
            "Collection".collection_info_id,
            "CardState".card_info_id,
            "CollectionInfo".type AS collection_info_type
        FROM "Collection"
        JOIN "Cards" ON "Collection".card_state_id = "Cards".card_state_id
        JOIN "CardState" ON "Collection".card_state_id = "CardState".card_state_id
        JOIN "CardInfo" ON "CardInfo".card_info_id = "CardState".card_info_id
        JOIN "CollectionInfo" ON "CollectionInfo".collection_info_id = "Collection".collection_info_id
        WHERE "Cards".game_id = $1
        AND "Collection".collection_info_id = $2
        ORDER BY "Collection".collection_index
        `,
        [
            game_id,
            collection_info_id,
        ],
    );

    return result;
}

dbEngineGameUno.getCollectionByGameIDAndCollectionInfoID = getCollectionByGameIDAndCollectionInfoID;

/**
 * Get a player based on their game_id and user_id
 *
 * @param game_id
 * @param user_id
 * @returns {Promise<any>}
 */
async function getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID(game_id, user_id) {
    debugPrinter.printFunction(getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID.name);
    const result = await db.any(
        `
        SELECT
            "Player".player_id,
            "Player".user_id,
            "Players".game_id,
            "Players".is_host,
            "User".display_name,
            "UserStatistic".num_wins,
            "UserStatistic".num_loss
        FROM "Player"
        JOIN "Players" ON "Player".player_id = "Players".player_id
        JOIN "Game" ON "Players".game_id = "Game".game_id
        JOIN "User" ON "Player".user_id = "User".user_id
        JOIN "UserStatistic" ON "Player".user_id = "UserStatistic".user_id
        WHERE "Player".user_id = $1
        AND "Game".game_id = $2;
        `,
        [
            user_id,
            game_id,
        ],
    );

    return result[0];
}

dbEngineGameUno.getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID = getPlayerRowJoinPlayersRowJoinGameRowByGameIDAndUserID;

/**
 * Get all Player Rows based the game_id
 *
 * @param game_id
 * @param user_id
 * @returns {Promise<any>}
 */
async function getPlayerRowsJoinPlayersRowJoinGameRowByGameID(game_id) {
    debugPrinter.printFunction(getPlayerRowsJoinPlayersRowJoinGameRowByGameID.name);
    const result = await db.any(
        `
        SELECT
            "Player".player_id,
            "Player".user_id,
            "Players".game_id,
            "Players".is_host,
            "User".display_name,
            "UserStatistic".num_wins,
            "UserStatistic".num_loss
        FROM "Player"
        JOIN "Players" ON "Player".player_id = "Players".player_id
        JOIN "Game" ON "Players".game_id = "Game".game_id
        JOIN "User" ON "Player".user_id = "User".user_id
        JOIN "UserStatistic" ON "Player".user_id = "UserStatistic".user_id
        WHERE "Players".game_id = $1
        `,
        [
            game_id,
        ],
    );

    return result;
}

dbEngineGameUno.getPlayerRowsJoinPlayersRowJoinGameRowByGameID = getPlayerRowsJoinPlayersRowJoinGameRowByGameID;

async function getNumberOfPlayersRowsByGameID(game_id) {
    debugPrinter.printFunction(getNumberOfPlayersRowsByGameID.name);

    const result = await db.any(
        `
        SELECT COUNT(*)
        FROM "Players"
        WHERE "Players".game_id = $1
        `,
        [game_id],
    );

    return result[0];
}
dbEngineGameUno.getNumberOfPlayersRowsByGameID = getNumberOfPlayersRowsByGameID;

// async function getPlayersRowsByGameID(game_id) {
//     debugPrinter.printFunction(getPlayersRowsByGameID.name);
//
//     const result = await db.any(
//         `
//         SELECT *
//         FROM "Players"
//         WHERE "Players".game_id = $1
//         `,
//         [game_id],
//     );
//
//     return result;
// }
// dbEngineGameUno.getPlayersRowsByGameID = getPlayersRowsByGameID;

module.exports = dbEngineGameUno;
