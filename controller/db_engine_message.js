/*
Notes:
    Do not use db.one because returning nothing is not an error

 */
const debugPrinter = require('../util/debug_printer');
const db = require('../db/index');

const dbEngineMessage = {};

async function createMessageRow(game_id, player_id, message) {
    debugPrinter.printFunction(createMessageRow.name);
    const result = await db.any(
        `
        WITH messageRow AS (
            INSERT INTO "Message" (game_id, player_id, message)
            VALUES ($1, $2, $3)
            RETURNING *
        )
        SELECT 
            "Player".player_id, 
            messageRow.message_id, 
            messageRow.game_id, 
            messageRow.message, 
            messageRow.time_stamp, 
            "User".display_name 
        FROM "Player"
        JOIN messageRow ON "Player".player_id=messageRow.player_id
        JOIN "User" ON "Player".user_id="User".user_id;
        `,
        [game_id, player_id, message],
    );
    // debugPrinter.printBackendCyan(result);

    return result[0];
}

dbEngineMessage.createMessageRow = createMessageRow;

async function getMessageRowsByGameID(game_id) {
    debugPrinter.printFunction(getMessageRowsByGameID.name); // TODO FIX THIS ONE TOO LIKE THE ABOVE FOR THE SPECIFIC STUFF TO RETURN
    const result = await db.any(
        `
        SELECT 
            "Player".player_id, 
            messageRow.message_id, 
            messageRow.game_id, 
            messageRow.message, 
            messageRow.time_stamp, 
            "User".display_name 
        FROM "Player"
        JOIN "Message" ON "Player".player_id="Message".player_id
        JOIN "User" ON "Player".user_id="User".user_id;
        `,
        [game_id],
    );

    return result;
}

dbEngineMessage.getMessageRowsByGameID = getMessageRowsByGameID;

module.exports = dbEngineMessage;
