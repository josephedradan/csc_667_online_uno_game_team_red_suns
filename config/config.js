require("dotenv").config();
module.exports = {
    development: {
        use_env_variable: "DATABASE_URL",
        dialect: "postgres",
        /*
        *FIXME: The below is here so that you can execute db commands to the heroku postgres server from your local machine.
        * Remove this if you don't want that effect. Obviously, this is not meant to be used in a real production environment
        */
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },

        },
    },
    test: {
        use_env_variable: "DATABASE_URL",
        dialect: "postgres",
    },
    production: {
        use_env_variable: "DATABASE_URL",
        dialect: "postgres",
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
    },
};
