/*
Simple constants file
 */


const path = require("path");
let constants = {}

constants.dirLayouts = path.join(__dirname, "../views/layouts")
constants.dirPartials = path.join(__dirname, "../views/partials")
constants.dirViews = path.join(__dirname, "../views")
constants.dirPublic = path.join(__dirname, "../public")

module.exports = constants
