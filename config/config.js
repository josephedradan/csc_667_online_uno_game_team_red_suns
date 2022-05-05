/*

WARNING:
    DO NOT CHANGE THE NAME OF THIS FILE OR YOU WILL BREAK MIGRATIONS
 */
require('dotenv').config();

module.exports = {
    // Development DB should be your local postgres db
    development: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        timezone: 'America/Los_Angeles',
        /*
         *FIXME: The below is here so that you can execute db commands to the heroku postgres server from your local machine.
         * Remove the below if you don't want that effect. Obviously, this is not meant to be used in a real production environment.
         * Also, the below will break the server if you are on a local machine using a local database.
         */
        // dialectOptions: {
        //     ssl: {
        //         require: true,
        //         rejectUnauthorized: false,
        //     },
        // },
    },

    // Test DB is not used nor created
    test: {
        use_env_variable: 'DATABASE_URL_TEST',
        dialect: 'postgres',
    },

    // Production DB is the DB used in production. Heroku's DATABASE_URL === DATABASE_URL_PRODUCTION
    production: {
        use_env_variable: 'DATABASE_URL_PRODUCTION',
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
            // ssl: true,
            // extra: {
            //     ssl: {
            //         rejectUnauthorized: false,
            //     },
            // },
        },
        // timezone: "America/Los_Angeles",
    },
};
