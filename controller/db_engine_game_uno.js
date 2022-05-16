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
async function getCardInfoRowsByColor(color) {
    debugPrinter.printFunction(getCardInfoRowsByColor.name);
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

dbEngineGameUno.getCardInfoRowsByColor = getCardInfoRowsByColor;

/**
 * Notes:
 *      Acceptable values: NUMBER, SPECIAL
 *
 * @param type
 * @returns {Promise<any[]>}
 */
async function getCardInfoRowsByType(type) {
    debugPrinter.printFunction(getCardInfoRowsByType.name);
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

dbEngineGameUno.getCardInfoRowsByType = getCardInfoRowsByType;

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

async function getUserRowByPlayerID(player_id) {
    debugPrinter.printFunction(getUserRowByPlayerID.name);
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

dbEngineGameUno.getUserRowByPlayerID = getUserRowByPlayerID;

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
 * @returns {Promise<any>}
 */
async function createPlayersRow(game_id, player_id) {
    debugPrinter.printFunction(createPlayersRow.name);
    const result = await db.any(
        `
        INSERT INTO "Players" (game_id, player_id) 
        VALUES ($1, $2)
        RETURNING *;
        `,
        [
            game_id,
            player_id,
        ],
    );

    return result[0];
}

dbEngineGameUno.createPlayersRow = createPlayersRow;

// 1 CALL ACID PROOF JOIN GAME
async function createPlayerRowAndCreatePlayersRow(user_id, game_id) {
    debugPrinter.printFunction(createPlayerRowAndCreatePlayersRow.name);
    const result = await db.any(
        `
        WITH playerRow AS(
            INSERT INTO "Player" (user_id)
            VALUES ($1)
            RETURNING *
        ), playersRow AS(
            INSERT INTO "Players" (game_id, player_id) 
            SELECT $2, playerRow.player_id
            FROM playerRow
            RETURNING *
        )
        SELECT
            playerRow.player_id,
            playerRow.user_id,
            playersRow.game_id,
            "User".display_name,
            "UserStatistic".num_wins,
            "UserStatistic".num_loss,
            playersRow.in_game,
            playersRow.uno_check
        FROM playerRow
        JOIN playersRow ON playerRow.player_id = playersRow.player_id
        JOIN "Game" ON playersRow.game_id = "Game".game_id
        JOIN "User" ON playerRow.user_id = "User".user_id
        JOIN "UserStatistic" ON playerRow.user_id = "UserStatistic".user_id
        WHERE playerRow.user_id = $1
        AND "Game".game_id = $2;
        `,
        [
            user_id, game_id,
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
async function createGameRow(player_id_host) {
    debugPrinter.printFunction(createGameRow.name);
    const result = await db.any(
        `
        INSERT INTO "Game" (player_id_host)
        VALUES ($1)
        RETURNING *;
        `,
        [
            player_id_host,
        ],
    );

    return result[0];
}

dbEngineGameUno.createGameRow = createGameRow;

async function createGameDataRow(game_id) {
    debugPrinter.printFunction(createGameDataRow.name);
    const result = await db.any(
        `
        INSERT INTO "GameData" (game_id)
        VALUES ($1)
        RETURNING *;
        `,
        [
            game_id,
        ],
    );

    return result[0];
}

dbEngineGameUno.createGameDataRow = createGameDataRow;

/**
 * Create Card rows based on deckMultiplier
 *
 * IMPORTANT NOTES:
 *      Use createCardRowsAndCardsRowsAndCollectionRowsWithCollectionRandomized instead
 *
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
// async function createCardRows(deckMultiplier) {
//     debugPrinter.printFunction(createCardRows.name);
//     const result = await db.any(
//         `
//         INSERT INTO "Card" (card_info_id)
//         SELECT temp.card_info_id
//         FROM (
//             SELECT card_info_id
//             FROM "CardInfo"
//             CROSS JOIN generate_series(0, $1)
//         ) AS temp
//         RETURNING *;
//         `,
//         [
//             deckMultiplier,
//         ],
//     );
//
//     return result;
// }
//
// dbEngineGameUno.createCardRows = createCardRows; // Don't use this

/**
 * Create Card rows and Cards rows at the same time
 *
 * IMPORTANT NOTES:
 *      Use createCardRowsAndCardsRowsAndCollectionRowsWithCollectionRandomized instead
 *
 * Notes:
 *      Inserts rows for Cards based on the inserted rows from Card
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
// async function createCardRowsAndCardsRows(game_id, deckMultiplier) {
//     debugPrinter.printFunction(createCardRowsAndCardsRows.name);
//     const result = await db.any(
//         `
//         WITH cardRows AS (
//             INSERT INTO "Card" (card_info_id)
//             SELECT temp.card_info_id
//             FROM (
//                 SELECT card_info_id
//                 FROM "CardInfo"
//                 CROSS JOIN generate_series(1, $1)
//             ) AS temp
//             RETURNING *
//         ), cardsRows AS(
//             INSERT INTO "Cards" (game_id, card_id)
//             SELECT $2, cardRows.card_id
//             FROM cardRows
//             RETURNING *
//         )
//         SELECT
//             cardsRows.game_id,
//             cardRows.card_id,
//             cardRows.card_info_id
//         FROM cardsRows
//         LEFT JOIN cardRows ON cardsRows.card_id = cardRows.card_id;
//         `,
//         [
//             deckMultiplier,
//             game_id,
//         ],
//     );
//
//     return result;
// }
//
// dbEngineGameUno.createCardRowsAndCardsRows = createCardRowsAndCardsRows; // Don't use this

/**
 * Create Collection Row based on card_id, collection_info_id, collection_index
 *
 * IMPORTANT NOTES:
 *      Use createCardRowsAndCardsRowsAndCollectionRowsWithCollectionRandomized instead
 *
 * Notes:
 *      This function is made primarily because shuffling the indies of the Card Rows is difficult, so the job
 *      is off loaded to JS
 *
 * @param card_id
 * @param collection_info_id
 * @param collection_index
 * @returns {Promise<void>}
 */
// async function createCollectionRow(card_id, collection_info_id, collection_index) {
//     const result = await db.any(
//         `
//         INSERT INTO "Collection" (card_id, collection_info_id, collection_index)
//         VALUES ($1, $2, $3)
//         RETURNING *
//         `,
//         [
//             card_id,
//             collection_info_id,
//             collection_index,
//         ],
//     );
//
//     return result[0];
// }
//
// dbEngineGameUno.createCollectionRow = createCollectionRow; // Don't use this

/**
 * Create Card Rows, Collection Rows, and Cards Rows for a game_id without randomizing the Collection.collection_index
 * for each newly created Collection.card_id based on the given game_id
 *
 * IMPORTANT NOTES:
 *      This will set the collection_index of all Collection Rows as 0
 *      Use createCardRowsAndCardsRowsAndCollectionRowsWithCollectionRandomized instead
 * Notes:
 *      Create Card Rows
 *          Create Card Rows based on Card.card_id and CardInfo.card_info_id
 *          Create Collection Rows based on Card.card_id and CollectionInfo.collection_info_id
 *          Create Cards Rows based on Card.card_id and Game.game_id
 *
 * @param game_id
 * @param deckMultiplier
 * @returns {Promise<any[]>}
 */
// async function createCardRowsAndCardsRowsAndCollectionRows(game_id, deckMultiplier) {
//     debugPrinter.printFunction(createCardRowsAndCardsRowsAndCollectionRows.name);
//     const result = await db.any(
//         `
//         WITH cardRows AS (
//             INSERT INTO "Card" (card_info_id)
//             SELECT temp.card_info_id
//             FROM (
//                 SELECT card_info_id
//                 FROM "CardInfo"
//                 CROSS JOIN generate_series(1, $2)
//                 ) AS temp
//             RETURNING *
//         ), collectionRows AS (
//             INSERT INTO "Collection" (card_id, collection_info_id, collection_index)
//             SELECT card_id, 1, 0
//             FROM cardRows
//             RETURNING *
//         ), cardsRows AS(
//             INSERT INTO "Cards" (game_id, card_id)
//             SELECT $1, cardRows.card_id
//             FROM cardRows
//             RETURNING *
//         )
//         SELECT
//             cardsRows.game_id,
//             cardRows.card_id,
//             cardRows.card_info_id,
//             collectionRows.collection_info_id,
//             collectionRows.player_id,
//             collectionRows.collection_index
//         FROM cardsRows
//         LEFT JOIN cardRows ON cardsRows.card_id = cardRows.card_id
//         LEFT JOIN collectionRows ON cardsRows.card_id = collectionRows.card_id;
//         `,
//         [
//             game_id,
//             deckMultiplier,
//         ],
//     );
//
//     return result;
// }
//
// dbEngineGameUno.createCardRowsAndCardsRowsAndCollectionRows = createCardRowsAndCardsRowsAndCollectionRows; // Don't use this

/**
 * Create Card Rows, Collection Rows, and Cards Rows for a game_id
 *
 *
 * Notes:
 *      Create Card Rows
 *          Create Card Rows based on Card.card_id and CardInfo.card_info_id
 *          Create Collection Rows based on Card.card_id and CollectionInfo.collection_info_id
 *          Create Cards Rows based on Card.card_id and Game.game_id
 *
 *      Will randomized Collection.collection_index for newly created Card.card_id for the given game_id
 *
 * @param game_id
 * @param deckMultiplier
 * @returns {Promise<any[]>}
 */
async function createCardRowsAndCardsRowsAndCollectionRowsWithCollectionRandomized(game_id, deckMultiplier) {
    debugPrinter.printFunction(createCardRowsAndCardsRowsAndCollectionRowsWithCollectionRandomized.name);
    const result = await db.any(
        `
        WITH cardRows AS (
            INSERT INTO "Card" (card_info_id)
            SELECT temp.card_info_id
            FROM (
                SELECT card_info_id
                FROM "CardInfo"
                CROSS JOIN generate_series(1, $2)
                ) AS temp
            RETURNING *
        ), cardRowsRandom AS(
            SELECT *
            FROM cardRows
            ORDER BY RANDOM()
        ), cardRowsRandomWithRowNumber AS(
            SELECT *, ROW_NUMBER() OVER() AS row_number
            FROM cardRowsRandom
        ), collectionRows AS (
            INSERT INTO "Collection" (card_id, collection_info_id, collection_index)
            SELECT card_id, 1, cardRowsRandomWithRowNumber.row_number - 1
            FROM cardRowsRandomWithRowNumber
            RETURNING *
        ), cardsRows AS(
            INSERT INTO "Cards" (game_id, card_id)
            SELECT $1, cardRows.card_id
            FROM cardRows
            RETURNING *
        )
        SELECT 
            cardsRows.game_id, 
            cardRows.card_id, 
            cardRows.card_info_id, 
            collectionRows.collection_info_id, 
            collectionRows.player_id,
            collectionRows.collection_index,
            "CardInfo".type,
            "CardInfo".content,
            "CardInfo".color,
            "CollectionInfo".type AS collection_info_type
        FROM cardsRows
        LEFT JOIN cardRows ON cardsRows.card_id = cardRows.card_id
        LEFT JOIN collectionRows ON cardsRows.card_id = collectionRows.card_id
        LEFT JOIN "CardInfo" ON cardRows.card_info_id = "CardInfo".card_info_id
        LEFT JOIN "CollectionInfo" ON "CollectionInfo".collection_info_id = collectionRows.collection_info_id
        ORDER BY collectionRows.collection_index;
        `,
        [
            game_id,
            deckMultiplier,
        ],
    );

    return result;
}

dbEngineGameUno.createCardRowsAndCardsRowsAndCollectionRowsWithCollectionRandomized = createCardRowsAndCardsRowsAndCollectionRowsWithCollectionRandomized;

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
 *          Reference:
 *              https://stackoverflow.com/questions/25571094/joining-a-series-in-postgres-with-a-select-query
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
async function randomizeCollectionRowsByGameIDAndPlayerID(game_id, player_id) {
    debugPrinter.printFunction(randomizeCollectionRowsByGameIDAndPlayerID.name);
    const result = await db.any(
        `
        WITH cardsRows AS(
            SELECT game_id, "Collection".card_id
            FROM "Collection"
            JOIN "Cards" ON "Collection".card_id = "Cards".card_id
            WHERE "Cards".game_id = $1
            AND "Collection".player_id = $2
            ORDER BY RANDOM()
        ), cardsRowsWithRowNumber AS(
            SELECT *, ROW_NUMBER() OVER() AS row_number
            FROM cardsRows
        )
        UPDATE "Collection"
        SET collection_index = cardsRowsWithRowNumber.row_number - 1
        FROM cardsRowsWithRowNumber
        WHERE cardsRowsWithRowNumber.game_id = $1
        AND cardsRowsWithRowNumber.card_id = "Collection".card_id
        AND "Collection".player_id = $2
        RETURNING *;
        
        SELECT 
            "Cards".game_id,
            "CardInfo".type,
            "CardInfo".color,
            "CardInfo".content,
            "Collection".player_id,
            "Collection".collection_index,
            "Collection".card_id,
            "Collection".collection_info_id,
            "Card".card_info_id,
            "CollectionInfo".type AS collection_info_type
        FROM "Collection"
        JOIN "Cards" ON "Collection".card_id = "Cards".card_id
        JOIN "Card" ON "Collection".card_id = "Card".card_id
        JOIN "CardInfo" ON "CardInfo".card_info_id = "Card".card_info_id
        JOIN "CollectionInfo" ON "CollectionInfo".collection_info_id = "Collection".collection_info_id
        WHERE "Cards".game_id = $1
        AND "Collection".player_id = $2
        ORDER BY "Collection".collection_index;
        `,
        [
            game_id,
            player_id,
        ],
    );

    return result;
}

dbEngineGameUno.randomizeCollectionRowsByGameIDAndPlayerID = randomizeCollectionRowsByGameIDAndPlayerID;

/**
 * Randomize Collection (DRAW | PLAY | HAND) by game_id and collection_info_id
 *
 * Notes:
 *      FIXME: WARNING, DO NOT DO THIS CALL THIS ON collection_info_id === 3, IT WILL BREAK THE INDICES FOR THE ENTIRE COLLECTION OF THE GAME
 *
 * @param game_id
 * @param collection_info_id
 * @returns {Promise<any>}
 */
async function randomizeCollectionRowsByGameIDAndCollectionInfoID(game_id, collection_info_id) {
    debugPrinter.printFunction(randomizeCollectionRowsByGameIDAndCollectionInfoID.name);
    const result = await db.any(
        `
        WITH cardsRows AS(
            SELECT game_id, "Collection".card_id
            FROM "Collection"
            JOIN "Cards" ON "Collection".card_id = "Cards".card_id
            WHERE "Cards".game_id = $1
            AND "Collection".collection_info_id = $2
            ORDER BY RANDOM()
        ), cardsRowsWithRowNumber AS(
            SELECT *, ROW_NUMBER() OVER() AS row_number
            FROM cardsRows
        )
        UPDATE "Collection"
        SET collection_index = cardsRowsWithRowNumber.row_number - 1
        FROM cardsRowsWithRowNumber
        WHERE cardsRowsWithRowNumber.game_id = $1
        AND cardsRowsWithRowNumber.card_id = "Collection".card_id
        AND "Collection".collection_info_id = $2
        RETURNING *;
        
        SELECT 
            "Cards".game_id,
            "CardInfo".type,
            "CardInfo".color,
            "CardInfo".content,
            "Collection".player_id,
            "Collection".collection_index,
            "Collection".card_id,
            "Collection".collection_info_id,
            "Card".card_info_id,
            "CollectionInfo".type AS collection_info_type
        FROM "Collection"
        JOIN "Cards" ON "Collection".card_id = "Cards".card_id
        JOIN "Card" ON "Collection".card_id = "Card".card_id
        JOIN "CardInfo" ON "CardInfo".card_info_id = "Card".card_info_id
        JOIN "CollectionInfo" ON "CollectionInfo".collection_info_id = "Collection".collection_info_id
        WHERE "Cards".game_id = $1
        AND "Collection".collection_info_id = $2
        ORDER BY "Collection".collection_index;
        `,
        [
            game_id,
            collection_info_id,
        ],
    );

    return result;
}

dbEngineGameUno.randomizeCollectionRowsByGameIDAndCollectionInfoID = randomizeCollectionRowsByGameIDAndCollectionInfoID;

/**
 * Randomize Collection (DRAW | PLAY | HAND) by game_id
 *
 * IMPORTANT NOTES:
 *      DO NOT USE BECAUSE THE RANDOMIZED WILL MIX UP ALL THE COLLECTIONS TOGETHER WITHOUT CHANGING THEIR INDICES WITH RESPECT TO THE NEW COLLECTION THEY ARE IN.
 *      BASICALLY, CARD INDICES WILL BE WITH RESPECT TO ALL THE CARDS IN THE GAME WHICH WILL MESS UP PLAYING CARDS LOGIC.
 *
 * @param game_id
 * @returns {Promise<any>}
 */
// async function randomizeCollectionRowsByGameID(game_id) {
//     debugPrinter.printFunction(randomizeCollectionRowsByGameID.name);
//     const result = await db.any(
//         `
//         WITH cardsRows AS(
//             SELECT game_id, "Collection".card_id
//             FROM "Collection"
//             JOIN "Cards" ON "Collection".card_id = "Cards".card_id
//             WHERE "Cards".game_id = $1
//             ORDER BY RANDOM()
//         ), cardsRowsWithRowNumber AS(
//             SELECT *, ROW_NUMBER() OVER() AS row_number
//             FROM cardsRows
//         )
//         UPDATE "Collection"
//         SET collection_index = cardsRowsWithRowNumber.row_number - 1
//         FROM cardsRowsWithRowNumber
//         WHERE cardsRowsWithRowNumber.game_id = $1
//         AND cardsRowsWithRowNumber.card_id = "Collection".card_id
//         RETURNING *;
//
//         SELECT
//             "Cards".game_id,
//             "CardInfo".type,
//             "CardInfo".color,
//             "CardInfo".content,
//             "Collection".player_id,
//             "Collection".collection_index,
//             "Collection".card_id,
//             "Collection".collection_info_id,
//             "Card".card_info_id,
//             "CollectionInfo".type AS collection_info_type
//         FROM "Collection"
//         JOIN "Cards" ON "Collection".card_id = "Cards".card_id
//         JOIN "Card" ON "Collection".card_id = "Card".card_id
//         JOIN "CardInfo" ON "CardInfo".card_info_id = "Card".card_info_id
//         JOIN "CollectionInfo" ON "CollectionInfo".collection_info_id = "Collection".collection_info_id
//         WHERE "Cards".game_id = $1
//         ORDER BY "Collection".collection_index;
//         `,
//         [
//             game_id,
//         ],
//     );
//
//     return result;
// }
//
// dbEngineGameUno.randomizeCollectionRowsByGameID = randomizeCollectionRowsByGameID;

async function updateCollectionRowsPlayToDrawAndRandomizeDrawByGameID(game_id) {
    debugPrinter.printFunction(updateCollectionRowsPlayToDrawAndRandomizeDrawByGameID.name);
    const result = await db.any(
        `
            UPDATE "Collection"
            SET 
                collection_info_id = 1,
                player_id = null
            FROM "Cards"
            WHERE "Cards".card_id = "Collection".card_id
            AND "Cards".game_id = $1
            AND "Collection".collection_info_id = 2;
                
            WITH cardsRows AS(
                SELECT game_id, "Collection".card_id
                FROM "Collection"
                JOIN "Cards" ON "Collection".card_id = "Cards".card_id
                WHERE "Cards".game_id = $1
                ORDER BY RANDOM()
            ), cardsRowsWithRowNumber AS(
                SELECT *, ROW_NUMBER() OVER() AS row_number
                FROM cardsRows
            )
            UPDATE "Collection"
            SET collection_index = cardsRowsWithRowNumber.row_number - 1
            FROM cardsRowsWithRowNumber
            WHERE cardsRowsWithRowNumber.game_id = $1
            AND cardsRowsWithRowNumber.card_id = "Collection".card_id
            AND "Collection".collection_info_id = 1
            RETURNING *;
            
            SELECT 
                "Cards".game_id,
                "CardInfo".type,
                "CardInfo".color,
                "CardInfo".content,
                "Collection".player_id,
                "Collection".collection_index,
                "Collection".card_id,
                "Collection".collection_info_id,
                "Card".card_info_id,
                "CollectionInfo".type AS collection_info_type
            FROM "Collection"
            JOIN "Cards" ON "Collection".card_id = "Cards".card_id
            JOIN "Card" ON "Collection".card_id = "Card".card_id
            JOIN "CardInfo" ON "CardInfo".card_info_id = "Card".card_info_id
            JOIN "CollectionInfo" ON "CollectionInfo".collection_info_id = "Collection".collection_info_id
            WHERE "Cards".game_id = $1
            AND "Collection".collection_info_id = 1
            ORDER BY "Collection".collection_index;
        `,
        [
            game_id,
        ],
    );

    return result;
}

dbEngineGameUno.updateCollectionRowsPlayToDrawAndRandomizeDrawByGameID = updateCollectionRowsPlayToDrawAndRandomizeDrawByGameID;

async function deletePlayersRowByUserID(user_id) {
    debugPrinter.printFunction(deletePlayersRowByUserID.name);
    const result = await db.any(
        `
        DELETE FROM "Player"
        WHERE "Player".user_id = $1
        RETURNING *;
        `,
        [
            user_id,
        ],
    );

    return result[0];
}

dbEngineGameUno.deletePlayersRowByUserID = deletePlayersRowByUserID;

async function deletePlayerRowByPlayerID(player_id) {
    debugPrinter.printFunction(deletePlayerRowByPlayerID.name);
    const result = await db.any(
        `
        DELETE FROM "Player"
        WHERE "Player".player_id = $1
        RETURNING *;
        `,
        [
            player_id,
        ],
    );

    return result[0];
}

dbEngineGameUno.deletePlayerRowByPlayerID = deletePlayerRowByPlayerID;

async function deleteGameRow(game_id) {
    debugPrinter.printFunction(deleteGameRow.name);
    const result = await db.any(
        `
        DELETE FROM "Game"
        WHERE "Game".game_id = $1
        RETURNING *;
        `,
        [
            game_id,
        ],
    );

    return result[0];
}

dbEngineGameUno.deleteGameRow = deleteGameRow;

/**
 * Notes:
 *      This function can return undefined
 *
 * @param game_id
 * @returns {Promise<any>}
 */
async function getGameRowDetailedByGameID(game_id) {
    debugPrinter.printFunction(getGameRowDetailedByGameID.name);
    const result = await db.any(
        `
        SELECT 
            "Game".game_id, 
            "Game".is_active, 
            "Game".player_id_host, 
            "GameData".player_id_turn, 
            "GameData".is_clockwise, 
            "GameData".card_type_legal, 
            "GameData".card_content_legal,
            "GameData".card_color_legal,
            "GameData".skip_amount,
            "GameData".draw_amount,
            "GameData".is_uno_available,
            "GameData".is_challenge_available
        FROM "Game"
        JOIN "GameData" ON "Game".game_id = "GameData".game_id
        WHERE "Game".game_id = $1
        `,
        [
            game_id,
        ],
    );

    return result[0];
}

dbEngineGameUno.getGameRowDetailedByGameID = getGameRowDetailedByGameID;

/**
 * Notes:
 *      This function can return undefined
 *
 * @param game_id
 * @returns {Promise<any>}
 */
async function getGameRowSimpleByGameID(game_id) {
    debugPrinter.printFunction(getGameRowSimpleByGameID.name);
    const result = await db.any(
        `
        SELECT game_id, is_active, player_id_host
        FROM "Game"
        WHERE "Game".game_id = $1
        `,
        [
            game_id,
        ],
    );

    return result[0];
}

dbEngineGameUno.getGameRowSimpleByGameID = getGameRowSimpleByGameID;

/**
 * Get all games
 *
 * @param
 * @returns {Promise<any[]>}
 */
async function getGameRowsSimple() {
    debugPrinter.printFunction(getGameRowsSimple.name);

    const result = await db.any(
        `
        SELECT game_id, is_active
        FROM "Game"
        ORDER BY game_id DESC;
        `,
    );

    return result;
}

dbEngineGameUno.getGameRowsSimple = getGameRowsSimple;

/**
 * Get Collection by game_id
 *
 * Notes:
 *      Basically, get all cards in the game
 *
 * @param game_id
 * @returns {Promise<any[]>}
 */
async function getCollectionRowsDetailedByGameID(game_id) {
    debugPrinter.printFunction(getCollectionRowsDetailedByGameID.name);
    const result = await db.any(
        `
        SELECT 
            "Cards".game_id,
            "CardInfo".type,
            "CardInfo".color,
            "CardInfo".content,
            "Collection".player_id,
            "Collection".collection_index,
            "Collection".card_id,
            "Collection".collection_info_id,
            "Card".card_info_id,
            "CollectionInfo".type AS collection_info_type
        FROM "Collection"
        JOIN "Cards" ON "Collection".card_id = "Cards".card_id
        JOIN "Card" ON "Collection".card_id = "Card".card_id
        JOIN "CardInfo" ON "CardInfo".card_info_id = "Card".card_info_id
        JOIN "CollectionInfo" ON "CollectionInfo".collection_info_id = "Collection".collection_info_id
        WHERE "Cards".game_id = $1
        ORDER BY "Collection".collection_index ASC;
        `,
        [
            game_id,
        ],
    );

    return result;
}

dbEngineGameUno.getCollectionRowsDetailedByGameID = getCollectionRowsDetailedByGameID;

/**
 * Get Collection by player_id
 *
 * Notes:
 *      Basically, get all cards of a player
 *
 * @param player_id
 * @returns {Promise<any[]>}
 */
async function getCollectionRowsDetailedByPlayerID(player_id) {
    debugPrinter.printFunction(getCollectionRowsDetailedByPlayerID.name);
    const result = await db.any(
        `
        SELECT 
            "Cards".game_id,
            "CardInfo".type,
            "CardInfo".color,
            "CardInfo".content,
            "Collection".player_id,
            "Collection".collection_index,
            "Collection".card_id,
            "Collection".collection_info_id,
            "Card".card_info_id,
            "CollectionInfo".type AS collection_info_type
        FROM "Collection"
        JOIN "Cards" ON "Collection".card_id = "Cards".card_id
        JOIN "Card" ON "Collection".card_id = "Card".card_id
        JOIN "CardInfo" ON "CardInfo".card_info_id = "Card".card_info_id
        JOIN "CollectionInfo" ON "CollectionInfo".collection_info_id = "Collection".collection_info_id
        WHERE "Collection".player_id = $1
        ORDER BY "Collection".collection_index ASC;
        `,
        [
            player_id,
        ],
    );

    return result;
}

dbEngineGameUno.getCollectionRowsDetailedByPlayerID = getCollectionRowsDetailedByPlayerID;

async function getCollectionCountByPlayerID(player_id) {
    debugPrinter.printFunction(getCollectionCountByPlayerID.name);
    const result = await db.any(
        `
        SELECT 
            COUNT(*)
        FROM "Collection"
        JOIN "Cards" ON "Collection".card_id = "Cards".card_id
        JOIN "Card" ON "Collection".card_id = "Card".card_id
        WHERE "Collection".player_id = $1
        `,
        [
            player_id,
        ],
    );

    return parseInt(result[0].count, 10);
}

dbEngineGameUno.getCollectionCountByPlayerID = getCollectionCountByPlayerID;

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
async function getCollectionRowsDetailedByGameIDAndCollectionInfoID(game_id, collection_info_id) {
    debugPrinter.printFunction(getCollectionRowsDetailedByGameIDAndCollectionInfoID.name);
    const result = await db.any(
        `
        SELECT 
            "Cards".game_id,
            "CardInfo".type,
            "CardInfo".color,
            "CardInfo".content,
            "Collection".player_id,
            "Collection".collection_index,
            "Collection".card_id,
            "Collection".collection_info_id,
            "Card".card_info_id,
            "CollectionInfo".type AS collection_info_type
        FROM "Collection"
        JOIN "Cards" ON "Collection".card_id = "Cards".card_id
        JOIN "Card" ON "Collection".card_id = "Card".card_id
        JOIN "CardInfo" ON "CardInfo".card_info_id = "Card".card_info_id
        JOIN "CollectionInfo" ON "CollectionInfo".collection_info_id = "Collection".collection_info_id
        WHERE "Cards".game_id = $1
        AND "Collection".collection_info_id = $2
        ORDER BY "Collection".collection_index ASC;
        `,
        [
            game_id,
            collection_info_id,
        ],
    );

    return result;
}

dbEngineGameUno.getCollectionRowsDetailedByGameIDAndCollectionInfoID = getCollectionRowsDetailedByGameIDAndCollectionInfoID;

async function getCollectionCountByGameIDAndCollectionInfoID(game_id, collection_info_id) {
    debugPrinter.printFunction(getCollectionCountByGameIDAndCollectionInfoID.name);
    const result = await db.any(
        `
        SELECT 
            COUNT(*)
        FROM "Collection"
        JOIN "Cards" ON "Collection".card_id = "Cards".card_id
        JOIN "Card" ON "Collection".card_id = "Card".card_id
        WHERE "Cards".game_id = $1
        AND "Collection".collection_info_id = $2
        `,
        [
            game_id,
            collection_info_id,
        ],
    );

    return parseInt(result[0].count, 10);
}

dbEngineGameUno.getCollectionCountByGameIDAndCollectionInfoID = getCollectionCountByGameIDAndCollectionInfoID;

async function getCollectionRowsCollectionIndexByGameIDAndCollectionInfoID(game_id, collection_info_id) {
    debugPrinter.printFunction(getCollectionRowsCollectionIndexByGameIDAndCollectionInfoID.name);
    const result = await db.any(
        `
        SELECT 
            "Collection".collection_index
        FROM "Collection"
        JOIN "Cards" ON "Collection".card_id = "Cards".card_id
        WHERE "Cards".game_id = $1
        AND "Collection".collection_info_id = $2
        ORDER BY "Collection".collection_index ASC;
        `,
        [
            game_id,
            collection_info_id,
        ],
    );

    return result;
}

dbEngineGameUno.getCollectionRowsCollectionIndexByGameIDAndCollectionInfoID = getCollectionRowsCollectionIndexByGameIDAndCollectionInfoID;

async function getCollectionRowTopDetailedByGameIDAndCollectionInfoID(game_id, collection_info_id) {
    debugPrinter.printFunction(getCollectionRowTopDetailedByGameIDAndCollectionInfoID.name);
    const result = await db.any(
        `
        SELECT 
            "Cards".game_id,
            "CardInfo".type,
            "CardInfo".color,
            "CardInfo".content,
            "Collection".player_id,
            "Collection".collection_index,
            "Collection".card_id,
            "Collection".collection_info_id,
            "Card".card_info_id,
            "CollectionInfo".type AS collection_info_type
        FROM "Collection"
        JOIN "Cards" ON "Collection".card_id = "Cards".card_id
        JOIN "Card" ON "Collection".card_id = "Card".card_id
        JOIN "CardInfo" ON "CardInfo".card_info_id = "Card".card_info_id
        JOIN "CollectionInfo" ON "CollectionInfo".collection_info_id = "Collection".collection_info_id
        WHERE "Cards".game_id = $1
        AND "Collection".collection_info_id = $2
        ORDER BY "Collection".collection_index DESC LIMIT 1;
        `,
        [
            game_id,
            collection_info_id,
        ],
    );

    return result[0];
}

dbEngineGameUno.getCollectionRowTopDetailedByGameIDAndCollectionInfoID = getCollectionRowTopDetailedByGameIDAndCollectionInfoID;

/**
 * Get a player based on their game_id and user_id
 *
 * @param game_id
 * @param user_id
 * @returns {Promise<any>}
 */
async function getPlayerRowDetailedByGameIDAndUserID(user_id, game_id) {
    debugPrinter.printFunction(getPlayerRowDetailedByGameIDAndUserID.name);
    const result = await db.any(
        `
        SELECT
            "Player".player_id,
            "Player".user_id,
            "Players".game_id,
            "User".display_name,
            "UserStatistic".num_wins,
            "UserStatistic".num_loss,
            "Players".in_game,
            "Players".uno_check
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

dbEngineGameUno.getPlayerRowDetailedByGameIDAndUserID = getPlayerRowDetailedByGameIDAndUserID;

async function getPlayerRowDetailedByPlayerID(player_id) {
    debugPrinter.printFunction(getPlayerRowDetailedByPlayerID.name);
    const result = await db.any(
        `
        SELECT
            "Player".player_id,
            "Player".user_id,
            "Players".game_id,
            "User".display_name,
            "UserStatistic".num_wins,
            "UserStatistic".num_loss,
            "Players".in_game,
            "Players".uno_check
        FROM "Player"
        JOIN "Players" ON "Player".player_id = "Players".player_id
        JOIN "Game" ON "Players".game_id = "Game".game_id
        JOIN "User" ON "Player".user_id = "User".user_id
        JOIN "UserStatistic" ON "Player".user_id = "UserStatistic".user_id
        WHERE "Player".player_id = $1;
        `,
        [
            player_id,
        ],
    );

    return result[0];
}

dbEngineGameUno.getPlayerRowDetailedByPlayerID = getPlayerRowDetailedByPlayerID;

/**
 * Get all Player Rows based the game_id
 *
 * @param game_id
 * @param user_id
 * @returns {Promise<any>}
 */
async function getPlayerRowsDetailedByGameID(game_id) {
    debugPrinter.printFunction(getPlayerRowsDetailedByGameID.name);
    const result = await db.any(
        `
        SELECT
            "Player".player_id,
            "Player".user_id,
            "Players".game_id,
            "User".display_name,
            "UserStatistic".num_wins,
            "UserStatistic".num_loss,
            "Players".in_game,
            "Players".uno_check
        FROM "Player"
        JOIN "Players" ON "Player".player_id = "Players".player_id
        JOIN "Game" ON "Players".game_id = "Game".game_id
        JOIN "User" ON "Player".user_id = "User".user_id
        JOIN "UserStatistic" ON "Player".user_id = "UserStatistic".user_id
        WHERE "Players".game_id = $1;
        `,
        [
            game_id,
        ],
    );

    return result;
}

dbEngineGameUno.getPlayerRowsDetailedByGameID = getPlayerRowsDetailedByGameID;

async function getPlayerRowsSimpleInGame(game_id) {
    debugPrinter.printFunction(getPlayerRowsSimpleInGame.name);
    const result = await db.any(
        `
        SELECT
            "Player".player_id,
            "Player".user_id,
            "Players".game_id,
            "User".display_name
        FROM "Player"
        JOIN "Players" ON "Player".player_id = "Players".player_id
        JOIN "Game" ON "Players".game_id = "Game".game_id
        JOIN "User" ON "Player".user_id = "User".user_id
        WHERE "Players".game_id = $1
        AND "Game".is_active = true
        AND "Players".in_game = true
        ORDER BY "Player".player_id ASC;
        `,
        [
            game_id,
        ],
    );

    return result;
}

dbEngineGameUno.getPlayerRowsSimpleInGame = getPlayerRowsSimpleInGame;

async function updatePlayersRowsInGameRows(game_id, boolean) {
    debugPrinter.printFunction(updatePlayersRowsInGameRows.name);
    const result = await db.any(
        `
        UPDATE "Players"
        SET
            in_game = $2
        WHERE "Players".game_id = $1
        RETURNING *;
        `,
        [
            game_id,
            boolean,
        ],
    );

    return result;
}

dbEngineGameUno.updatePlayersRowsInGameRows = updatePlayersRowsInGameRows;

// TODO CALL THIS WHEN A PLAYER WINS
async function updatePlayersRowInGameRowByPlayerID(game_id, player_id, boolean) {
    debugPrinter.printFunction(updatePlayersRowInGameRowByPlayerID.name);
    const result = await db.any(
        `
        UPDATE "Players"
        SET
            in_game = $3
        WHERE "Players".game_id = $1
        AND "Players".player_id = $2
        RETURNING *;
        `,
        [
            game_id,
            player_id,
            boolean,
        ],
    );

    return result[0];
}

dbEngineGameUno.updatePlayersRowInGameRowByPlayerID = updatePlayersRowInGameRowByPlayerID;

async function getPlayersCountByGameID(game_id) {
    debugPrinter.printFunction(getPlayersCountByGameID.name);

    const result = await db.any(
        `
        SELECT COUNT(*)
        FROM "Players"
        WHERE "Players".game_id = $1
        `,
        [game_id],
    );

    return parseInt(result[0].count, 10);
}

dbEngineGameUno.getPlayersCountByGameID = getPlayersCountByGameID;

async function getCollectionRowsCollectionIndexByPlayerID(player_id) {
    debugPrinter.printFunction(getCollectionRowsCollectionIndexByPlayerID.name);

    const result = await db.any(
        `
        SELECT collection_index
        FROM "Collection"
        WHERE "Collection".player_id = $1
        ORDER BY "Collection".collection_index ASC;
        `,
        [player_id],
    );

    return result;
}

dbEngineGameUno.getCollectionRowsCollectionIndexByPlayerID = getCollectionRowsCollectionIndexByPlayerID;

async function getCollectionRowsCollectionIndexDrawByGameID(game_id) {
    debugPrinter.printFunction(getCollectionRowsCollectionIndexDrawByGameID.name);

    const result = await db.any(
        `
        SELECT collection_index
        FROM "Collection"
        JOIN "Cards" ON "Collection".card_id = "Cards".card_id
        WHERE "Cards".game_id = $1
        ORDER BY "Collection".collection_index ASC;
        `,
        [game_id],
    );

    return result;
}

dbEngineGameUno.getCollectionRowsCollectionIndexDrawByGameID = getCollectionRowsCollectionIndexDrawByGameID;

async function updateGameRowIsActiveByGameID(game_id, boolean) {
    debugPrinter.printFunction(updateGameRowIsActiveByGameID.name);

    const result = await db.any(
        `
        UPDATE "Game"
        SET is_active = $2
        WHERE "Game".game_id = $1
        RETURNING game_id, is_active, player_id_host;
        `,
        [
            game_id,
            boolean,
        ],
    );

    return result[0];
}

dbEngineGameUno.updateGameRowIsActiveByGameID = updateGameRowIsActiveByGameID;

async function updateGameRowPlayerIDHostByGameID(game_id, player_id) {
    debugPrinter.printFunction(updateGameRowPlayerIDHostByGameID.name);

    const result = await db.any(
        `
        UPDATE "Game"
        SET player_id_host = $2
        WHERE "Game".game_id = $1
        RETURNING game_id, is_active, player_id_host;
        `,
        [
            game_id,
            player_id,
        ],
    );

    return result[0];
}

dbEngineGameUno.updateGameRowPlayerIDHostByGameID = updateGameRowPlayerIDHostByGameID;

async function updateCollectionRowDrawToHandTop(game_id, player_id) {
    debugPrinter.printFunction(updateCollectionRowDrawToHandTop.name);

    const result = await db.any(
        `
        WITH collectionRowDrawTop AS (
            SELECT "Collection".card_id
            FROM "Collection" 
            JOIN "Cards" ON "Collection".card_id = "Cards".card_id
            WHERE "Cards".game_id = $1
            AND "Collection".collection_info_id = 1
            ORDER BY collection_index DESC LIMIT 1
        ), collectionRowHandNumberOfRows AS (
            SELECT COUNT(*) as amount
            FROM "Collection" 
            JOIN "Cards" ON "Collection".card_id = "Cards".card_id
            WHERE "Cards".game_id = $1
            AND "Collection".player_id = $2
        )
        UPDATE "Collection" 
        SET    
            player_id = $2,
            collection_info_id = 3,
            collection_index = (SELECT amount FROM collectionRowHandNumberOfRows)
        FROM collectionRowDrawTop 
        WHERE "Collection".card_id = collectionRowDrawTop.card_id
        RETURNING *;
        `,
        [
            game_id,
            player_id,
        ],
    );

    return result[0];
}

dbEngineGameUno.updateCollectionRowDrawToHandTop = updateCollectionRowDrawToHandTop;

async function updateCollectionRowPlayToHandTop(game_id, player_id) {
    debugPrinter.printFunction(updateCollectionRowDrawToHandTop.name);

    const result = await db.any(
        `
        WITH collectionRowDrawTop AS (
            SELECT "Collection".card_id
            FROM "Collection" 
            JOIN "Cards" ON "Collection".card_id = "Cards".card_id
            WHERE "Cards".game_id = $1
            AND "Collection".collection_info_id = 2
            ORDER BY collection_index DESC LIMIT 1
        ), collectionRowHandNumberOfRows AS (
            SELECT COUNT(*) as amount
            FROM "Collection" 
            JOIN "Cards" ON "Collection".card_id = "Cards".card_id
            WHERE "Cards".game_id = $1
            AND "Collection".player_id = $2
        )
        UPDATE "Collection" 
        SET    
            player_id = $2,
            collection_info_id = 3,
            collection_index = (SELECT amount FROM collectionRowHandNumberOfRows)
        FROM collectionRowDrawTop 
        WHERE "Collection".card_id = collectionRowDrawTop.card_id
        RETURNING *;
        `,
        [
            game_id,
            player_id,
        ],
    );

    return result[0];
}

dbEngineGameUno.updateCollectionRowPlayToHandTop = updateCollectionRowPlayToHandTop;

async function updateCollectionRowDrawToPlayTop(game_id) {
    debugPrinter.printFunction(updateCollectionRowDrawToPlayTop.name);

    const result = await db.any(
        `
        WITH collectionRowDrawTop AS (
            SELECT "Collection".card_id
            FROM "Collection" 
            JOIN "Cards" ON "Collection".card_id = "Cards".card_id
            WHERE "Cards".game_id = $1
            AND "Collection".collection_info_id = 1
            ORDER BY collection_index DESC LIMIT 1
        ), collectionRowPlayNumberOfRows AS (
            SELECT COUNT(*) as amount
            FROM "Collection" 
            JOIN "Cards" ON "Collection".card_id = "Cards".card_id
            WHERE "Cards".game_id = $1
            AND "Collection".collection_info_id = 2
        )
        UPDATE "Collection" 
        SET    
            player_id = null,
            collection_info_id = 2,
            collection_index = (SELECT amount FROM collectionRowPlayNumberOfRows)
        FROM collectionRowDrawTop 
        WHERE "Collection".card_id = collectionRowDrawTop.card_id
        RETURNING *;
        `,
        [
            game_id,
        ],
    );

    return result[0];
}

dbEngineGameUno.updateCollectionRowDrawToPlayTop = updateCollectionRowDrawToPlayTop;

async function checkCollectionRowHandDetailedByCollectionIndex(player_id, collection_index) {
    debugPrinter.printFunction(checkCollectionRowHandDetailedByCollectionIndex.name);

    const result = await db.any(
        `
        SELECT 
            "Cards".game_id,
            "CardInfo".type,
            "CardInfo".color,
            "CardInfo".content,
            "Collection".player_id,
            "Collection".collection_index,
            "Collection".card_id,
            "Collection".collection_info_id,
            "Card".card_info_id,
            "CollectionInfo".type AS collection_info_type
        FROM "Collection"
        JOIN "Cards" ON "Collection".card_id = "Cards".card_id
        JOIN "Card" ON "Collection".card_id = "Card".card_id
        JOIN "CardInfo" ON "CardInfo".card_info_id = "Card".card_info_id
        JOIN "CollectionInfo" ON "CollectionInfo".collection_info_id = "Collection".collection_info_id
        WHERE "Collection".player_id = $1
        AND "Collection".collection_index = $2
        `,
        [
            player_id,
            collection_index,
        ],
    );

    return result[0];
}

dbEngineGameUno.checkCollectionRowHandDetailedByCollectionIndex = checkCollectionRowHandDetailedByCollectionIndex;

async function updateCollectionRowHandToPlayByCollectionIndexAndGetCollectionRowsDetailed(game_id, player_id, collection_index) {
    debugPrinter.printFunction(updateCollectionRowHandToPlayByCollectionIndexAndGetCollectionRowsDetailed.name);

    const result = await db.any(
        `
            WITH collectionRowHandRowByIndex AS (
                SELECT player_id, collection_index, "Collection".card_id, game_id
                From "Collection"
                JOIN "Cards" ON "Collection".card_id = "Cards".card_id
                WHERE player_id = $2
                AND collection_index = $3
            ), collectionRowPlayNumberOfRows AS (
                SELECT COUNT(*) as indexMax
                FROM "Collection"
                JOIN "Cards" ON "Collection".card_id = "Cards".card_id
                WHERE "Cards".game_id = $1
                AND "Collection".collection_info_id = 2
            )
            UPDATE "Collection"
            SET
                player_id = null,
                collection_info_id = 2,
                collection_index = (SELECT indexMax FROM collectionRowPlayNumberOfRows)
            FROM collectionRowHandRowByIndex
            WHERE "Collection".card_id = collectionRowHandRowByIndex.card_id
            RETURNING *;
            
            WITH collectionRowHandWithRowNumber AS (
                SELECT "Collection".card_id, ROW_NUMBER() OVER() AS row_number
                From "Collection"
                JOIN "Cards" ON "Collection".card_id = "Cards".card_id
                WHERE "Collection".player_id = $2
            )
            UPDATE "Collection"
            SET
                collection_index = collectionRowHandWithRowNumber.row_number - 1
            FROM collectionRowHandWithRowNumber
            WHERE collectionRowHandWithRowNumber.card_id = "Collection".card_id
            AND "Collection".player_id = $2
            RETURNING *;
            
            SELECT *
            From "Collection"
            JOIN "Cards" ON "Collection".card_id = "Cards".card_id
            WHERE "Collection".player_id = $2
            ORDER BY "Collection".collection_index ASC;
        `,
        [
            game_id,
            player_id,
            collection_index,
        ],
    );

    return result;
}

dbEngineGameUno.updateCollectionRowHandToPlayByCollectionIndexAndGetCollectionRowsDetailed = updateCollectionRowHandToPlayByCollectionIndexAndGetCollectionRowsDetailed;

async function getCollectionRowPlayPrevious(game_id) {
    debugPrinter.printFunction(getCollectionRowPlayPrevious.name);

    const result = await db.any(
        `
            WITH collectionCountPlay AS (
                SELECT COUNT(*) AS amount
                FROM "Collection"
                JOIN "Cards" ON "Collection".card_id = "Cards".card_id
                JOIN "Card" ON "Collection".card_id = "Card".card_id
                WHERE "Cards".game_id = $1
                AND "Collection".collection_info_id = 2
            )
            SELECT 
                "Cards".game_id,
                "CardInfo".type,
                "CardInfo".color,
                "CardInfo".content,
                "Collection".player_id,
                "Collection".collection_index,
                "Collection".card_id,
                "Collection".collection_info_id,
                "Card".card_info_id,
                "CollectionInfo".type AS collection_info_type
            FROM "Collection"
            JOIN "Cards" ON "Collection".card_id = "Cards".card_id
            JOIN "Card" ON "Collection".card_id = "Card".card_id
            JOIN "CardInfo" ON "CardInfo".card_info_id = "Card".card_info_id
            JOIN "CollectionInfo" ON "CollectionInfo".collection_info_id = "Collection".collection_info_id
            WHERE "Cards".game_id = $1
            AND "Collection".collection_info_id = 2
            AND "Collection".collection_index = (SELECT amount FROM collectionCountPlay) - 2 
        `,
        [
            game_id,
        ],
    );

    return result[0];
}

dbEngineGameUno.getCollectionRowPlayPrevious = getCollectionRowPlayPrevious;

/*
##############################################################################################################
GameData Related
##############################################################################################################
*/

async function updateGameDataRowIsClockwise(game_id, boolean) {
    debugPrinter.printFunction(updateGameDataRowIsClockwise.name);

    const result = await db.any(
        `
        UPDATE "GameData"
        SET 
            is_clockwise = $2
        WHERE "GameData".game_id = $1
        RETURNING *;
        `,
        [
            game_id,
            boolean,
        ],
    );

    return result[0];
}

dbEngineGameUno.updateGameDataRowIsClockwise = updateGameDataRowIsClockwise;

async function updateGameDataRowPlayerIDTurn(game_id, player_id) {
    debugPrinter.printFunction(updateGameDataRowPlayerIDTurn.name);

    const result = await db.any(
        `
        UPDATE "GameData"
        SET 
            player_id_turn = $2
        WHERE "GameData".game_id = $1
        RETURNING *;
        `,
        [
            game_id,
            player_id,
        ],
    );

    return result[0];
}

dbEngineGameUno.updateGameDataRowPlayerIDTurn = updateGameDataRowPlayerIDTurn;

async function updateGameDataRowCardLegal(game_id, card_type_legal, card_content_legal, card_color_legal) {
    debugPrinter.printFunction(updateGameDataRowCardLegal.name);

    const result = await db.any(
        `
        UPDATE "GameData"
        SET 
            card_type_legal = $2,
            card_content_legal = $3, 
            card_color_legal = $4
        WHERE "GameData".game_id = $1
        RETURNING *;
        `,
        [
            game_id,
            card_type_legal,
            card_content_legal,
            card_color_legal,
        ],
    );

    return result[0];
}

dbEngineGameUno.updateGameDataRowCardLegal = updateGameDataRowCardLegal;

async function updateGameDataRowSkipAmount(game_id, skipAmount) {
    debugPrinter.printFunction(updateGameDataRowSkipAmount.name);

    const result = await db.any(
        `
        UPDATE "GameData"
        SET 
            skip_amount = $2
        WHERE "GameData".game_id = $1
        RETURNING *;
        `,
        [
            game_id,
            skipAmount,
        ],
    );

    return result[0];
}

dbEngineGameUno.updateGameDataRowSkipAmount = updateGameDataRowSkipAmount;

async function updateGameDataRowDrawAmount(game_id, drawAmount) {
    debugPrinter.printFunction(updateGameDataRowDrawAmount.name);

    const result = await db.any(
        `
        UPDATE "GameData"
        SET 
            draw_amount = $2
        WHERE "GameData".game_id = $1
        RETURNING *;
        `,
        [
            game_id,
            drawAmount,
        ],
    );

    return result[0];
}

dbEngineGameUno.updateGameDataRowDrawAmount = updateGameDataRowDrawAmount;

async function updateGameDataRowIsUnoAvailable(game_id, boolean) {
    debugPrinter.printFunction(updateGameDataRowIsUnoAvailable.name);

    const result = await db.any(
        `
        UPDATE "GameData"
        SET 
            is_uno_available = $2
        WHERE "GameData".game_id = $1
        RETURNING *;
        `,
        [
            game_id,
            boolean,
        ],
    );

    return result[0];
}

dbEngineGameUno.updateGameDataRowIsUnoAvailable = updateGameDataRowIsUnoAvailable;

async function updateGameDataRowIsChallengeAvailable(game_id, boolean) {
    debugPrinter.printFunction(updateGameDataRowIsChallengeAvailable.name);

    const result = await db.any(
        `
        UPDATE "GameData"
        SET 
            is_challenge_available = $2
        WHERE "GameData".game_id = $1
        RETURNING *;
        `,
        [
            game_id,
            boolean,
        ],
    );

    return result[0];
}

dbEngineGameUno.updateGameDataRowIsChallengeAvailable = updateGameDataRowIsChallengeAvailable;

async function updatePlayerRowIsUnoCheckedByGameIdAndPlayerId(game_id, player_id, boolean) {
    debugPrinter.printFunction(updatePlayerRowIsUnoCheckedByGameIdAndPlayerId.name);

    const result = await db.any(
        `
        UPDATE "Players"
        SET 
            uno_check = $3
        WHERE "Players".game_id = $1 AND "Players".player_id = $2
        RETURNING *;
        `,
        [
            game_id,
            player_id,
            boolean,
        ],
    );

    return result[0];
}

dbEngineGameUno.updatePlayerRowIsUnoCheckedByGameIdAndPlayerId = updatePlayerRowIsUnoCheckedByGameIdAndPlayerId;

module.exports = dbEngineGameUno;
