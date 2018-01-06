var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'secret7'

module.exports = function (router) {

    //User Registration
    //http://localhost:8080/api/users
    router.post('/users', function (req, res) {
        var user = new User();
        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email;
        user.name = req.body.name;

        if (req.body.username == null || req.body.username == "" || req.body.password == "" || req.body.email == null || req.body.email == "" || req.body.name == null || req.body.name == "") {
            res.json({
                success: false,
                message: 'Please provide all the Fields'
            });
        } else {
            user.save(function (err) {
                if (err) {
                    if (err.errors != null) {
                        if (err.errors.name) {
                            res.json({
                                success: false,
                                message: err.errors.name.message
                            });
                        } else if (err.errors.email) {
                            res.json({
                                success: false,
                                message: err.errors.email.message
                            });
                        } else if (err.errors.username) {
                            res.json({
                                success: false,
                                message: err.errors.username.message
                            });
                        } else if (err.errors.password) {
                            res.json({
                                success: false,
                                message: err.errors.password.message
                            });
                        }
                    } else {
                        if (err.code == 11000) {
                            res.json({
                                success: false,
                                message: "Username or Email already taken"
                            });
                        } else {
                            res.json({
                                success: false,
                                message: err
                            });
                        }

                    }
                } else {
                    res.json({
                        success: true,
                        message: 'User created'
                    });
                }
            });
        }
    });

    //User Login
    //http://localhost:8080/api/aunthenticate
    router.post('/authenticate', function (req, res) {
        var validPassword;
        User.findOne({
            username: req.body.username
        }).select('email username password').exec(function (err, user) {
            if (err) throw err;

            if (!user) {
                res.json({
                    success: false,
                    message: 'Could not authenticate User!'
                });
            } else if (user) {
                if (req.body.password) {
                    /*console.log(req.body.password);
                    validPassword = user.comparePassword(req.body.password);
                    console.log(validPassword);*/
                    if (req.body.password == user.password)
                        validPassword = true;
                    else
                        validPassword = false;
                } else {
                    res.json({
                        success: false,
                        message: 'No Password provided!'
                    });
                }

                if (!validPassword) {
                    res.json({
                        success: false,
                        message: 'Could not authenticate Password!'
                    });
                } else {
                    var token = jwt.sign({
                        username: user.username,
                        email: user.email
                    }, secret, {
                        expiresIn: '24h'
                    });
                    res.json({
                        success: true,
                        message: 'User Authenticated!!',
                        token: token
                    });
                }
            }

        });
    });

    //http://localhost:8080/api/checkusername
    router.post('/checkusername', function (req, res) {
        var validPassword;
        User.findOne({
            username: req.body.username
        }).select('username').exec(function (err, user) {
            if (err) throw err;

            if (user) {
                res.json({
                    success: false,
                    message: 'Username is already taken!!'
                });
            } else {
                res.json({
                    success: true,
                    message: 'Valid Username'
                });
            }

        });
    });

    //http://localhost:8080/api/checkemail
    router.post('/checkemail', function (req, res) {
    User.findOne({
            email: req.body.email
        }).select('email').exec(function (err, user) {
            if (err) throw err;

            if (user) {
                res.json({
                    success: false,
                    message: 'E-Mail is already taken!!'
                });
            } else {
                res.json({
                    success: true,
                    message: 'Valid E-Mail'
                });
            }

        });
    });

    router.use(function (req, res, next) {
        var token = req.body.token || req.body.query || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    res.json({
                        success: false,
                        message: 'Token Invalid'
                    })
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            res.json({
                success: false,
                message: 'Token not provided'
            });
        }

    });

    //http://localhost:8080/api/userInfo
    router.post('/userInfo', function (req, res) {
        res.send(req.decoded);
    });

    return router;
}