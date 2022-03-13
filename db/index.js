const pgp = require("pg-promise")();
// const fs = require("fs");

const connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl:
        process.env.NODE_ENV !== "development"
            ? {
                  require: true,
                  rejectUnauthorized: false,
              }
            : false,
};

const connection = pgp(connectionConfig);

// const connection = pgp(process.env.DATABASE_URL);

module.exports = connection;