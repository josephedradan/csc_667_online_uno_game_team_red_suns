/*
Why useExpressMiddleware this file when you can useExpressMiddleware sequelize for raw queries...
 */
const pgp = require('pg-promise')();
// const fs = require("fs");

const connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl:
        process.env.NODE_ENV !== 'development' ? {
            require: true,
            rejectUnauthorized: false,
        } : false,
};

const db = pgp(connectionConfig);
// const db = pgp(connectionConfig);

// const db = pgp('postgres://postgres:root@localhost:5432/csc667-db');

module.exports = db;
