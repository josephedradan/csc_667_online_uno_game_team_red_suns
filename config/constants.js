/*
Simple constants file
 */

const path = require('path');

const constants = {};

constants.dirLayouts = path.join(__dirname, '../views/layouts');
constants.dirPartials = path.join(__dirname, '../views/partials');
constants.dirViews = path.join(__dirname, '../views');
constants.dirPublic = path.join(__dirname, '../public');

constants.socketIDRoomIndex = 'index';

constants.FAILURE = 'failure';
constants.SUCCESS = 'success';

constants.POST = 'POST';
constants.GET = 'GET';

module.exports = constants;
