const passport = require("passport");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require('bcrypt'); 

//the connection to the db
const db = require("../db/index");

async function getuserByUsername(username) {
    /*
    TODO: Implement, this needs to query the database and return a user object {user.username, user.password}
    */
}

function initializePassport(passport) {
    const authenticateUser = async (username, password, done) => {
        const userData = await getuserByUsername(username); 

        if (!userData) { 
            //case when user enters incorrect information; ie) incorrect password or username
            return done(null, false, { message: 'Incorrect username or password.'}); 
        }

        try {
            if(await bcrypt.compare(password, user.password)) {
                //case when user enters correct username password credentials
                return done(null, user); 
            }
        } catch(e) {
            //if bcrypt fails in comparison, unlikely?
            return done(e); 
        }

        passport.use(new LocalStrategy({usernameField: "username"}, authenticateUser)); 
        passport.serializeUser((user, done) => {done(null, user.username)}); 
        passport.deserializeUser((id, done) => {
            return done(null, getuserByUsername)
        })


    }
}

module.exports = initializePassport; 