//var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');
var TwitterStrategy = require('passport-twitter').Strategy;
var session = require('express-session'); // Import Express Session Package
var jwt = require('jsonwebtoken');
var secret = 'secret7';



module.exports = function (app, passport) {
    // Start Passport Configuration Settings
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false
        }
    }));
    // End Passport Configuration Settings

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use(new TwitterStrategy({
            consumerKey: 'Yqy3WzMyTr4aMFVn7z6iQ0L2M',
            consumerSecret: '5WD4uvCJTJTjy5KGhnOrws6cqWd898U1Xx9EQmTg9VpqSHqGKs',
            callbackURL: "http://localhost:8080/auth/twitter/callback",
            userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
        },
        function (token, tokenSecret, profile, done) {
            /*User.findOrCreate(..., function (err, user) {
                if (err) {
                    return done(err);
                }
                done(null, user);
            });*/
            done(null, profile);
        }
    ));

    //Twitter Routes
    app.get('/auth/twitter', passport.authenticate('twitter'));

    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            failureRedirect: '/twittererror'
        }));



    return passport;
}