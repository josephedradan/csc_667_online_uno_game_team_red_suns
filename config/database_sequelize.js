'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const debugPrinter = require("../util/debug_printer");

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const currentEnvConfig = require(__dirname + '/../config/config')[env];
const databaseSequelize = {};

let sequelize;

if (currentEnvConfig.use_env_variable) {

    // Create sequelize object based on environment variable
    sequelize = new Sequelize(
        process.env[currentEnvConfig.use_env_variable],
        currentEnvConfig);

} else {

    // Create sequelize object based on raw values in the current environment config settings in the json object
    sequelize = new Sequelize(
        currentEnvConfig.database,
        currentEnvConfig.username,
        currentEnvConfig.password,
        currentEnvConfig);
}

// Check if you can connect to the database
sequelize.authenticate()
    .then(() => {
        debugPrinter.printBackendGreen('Database Connected');
    })
    .catch((err) => {
        debugPrinter.printError(err);
    });

// Sync the database models if not exists
sequelize.sync();

// Fixme: What is the purpose of the below?
// fs.readdirSync(__dirname)
//     .filter(file => {
//         return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
//     })
//     .forEach(file => {
//         const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//
//         databaseSequelize[model.name] = model;
//     });
//
// Object.keys(databaseSequelize).forEach(modelName => {
//     if (databaseSequelize[modelName].associate) {
//         databaseSequelize[modelName].associate(databaseSequelize);
//     }
// });

module.exports = sequelize;
