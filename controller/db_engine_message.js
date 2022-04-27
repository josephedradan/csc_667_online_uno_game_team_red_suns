/*
Notes:
    Do not use db.one because returning nothing is not an error

 */
const debugPrinter = require("../util/debug_printer");
const db = require("../db/index");

const dbEngineMessage = {};

async function createMessageRow(game_id, player_id, message) {
    debugPrinter.printFunction(createMessageRow.name);
    const result = await db.any(
        `
        INSERT INTO "Message" (game_id, player_id, message)
        VALUES ($1, $2, $3)
        RETURNING *;
        `,
        [game_id, player_id, message]
    );
    // debugPrinter.printBackendCyan(result);

    return result[0];
}

dbEngineMessage.createMessageRow = createMessageRow;

async function getMessageRowsByGameID(game_id) {
    debugPrinter.printFunction(getMessageRowsByGameID.name);
    const result = await db.any(
        `
        SELECT * 
        From "Message"
        WHERE "Message".game_id = $1
        `,
        [game_id]
    );

    return result;
}

dbEngineMessage.getMessageRowsByGameID = getMessageRowsByGameID;

module.exports = dbEngineMessage;
