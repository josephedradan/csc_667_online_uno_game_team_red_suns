/*
This file creates the sequelize object based on db specified in config/config.js
This file also adds the models from where this file is located into the databaseSequelize object
Notes:
    This file is auto generated via the below command.
        npx sequelize-cli init
    The comments in this file are not auto generated.
    Don't do drastic changes to this file unless you know what you are doing
Reference:
    Node Sequelize tutorial with Postgres | Sequelize migrations and seed data
        Notes:
            Tutorial on Sequelize migrations and more
        Reference:
            https://www.youtube.com/watch?v=Eu-h3iUk45o
    Sequelize Migrations
        Notes:
            How to do migrations with Sequelize
        Reference:
            https://sequelize.org/docs/v6/other-topics/migrations/
 */

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const currentEnvConfig = require(`${__dirname}/../config/config`)[env];
const databaseSequelize = {};

let sequelize;

if (currentEnvConfig.use_env_variable) {
    // Create sequelize object based on environment variable
    sequelize = new Sequelize(
        process.env[currentEnvConfig.use_env_variable],
        currentEnvConfig,
    );
} else {
    // Create sequelize object based on raw values in the current environment config settings in the json object
    sequelize = new Sequelize(
        currentEnvConfig.database,
        currentEnvConfig.username,
        currentEnvConfig.password,
        currentEnvConfig,
    );
}

// Register models in the same dir as this file and add them to databaseSequelize
fs.readdirSync(__dirname)
    .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);

        databaseSequelize[model.name] = model;
    });

Object.keys(databaseSequelize)
    .forEach((modelName) => {
        if (databaseSequelize[modelName].associate) {
            databaseSequelize[modelName].associate(databaseSequelize);
        }
    });

databaseSequelize.sequelize = sequelize;
databaseSequelize.Sequelize = Sequelize;

module.exports = databaseSequelize;
